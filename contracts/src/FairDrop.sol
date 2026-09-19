// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title FairDrop
/// @notice Tokenized pre-order vault with a continuous Dutch Auction primary market
///         and a P2P secondary marketplace with a flat resale royalty.
/// @dev Single, immutable, unified contract — built in one day for Monad Blitz Paris.
///      See /docs/functional-spec.md for the full functional spec this contract implements.
contract FairDrop is ERC721, Ownable, ReentrancyGuard {
    // ---------------------------------------------------------------------
    // Constants — resale fee split (see docs/functional-spec.md §1)
    // ---------------------------------------------------------------------

    /// @notice Protocol fee on every secondary sale, in basis points (1% = 100 bps)
    uint256 public constant PROTOCOL_FEE_BPS = 100;
    /// @notice Official reseller (brand/franchise) royalty on every secondary sale, in basis points (1%)
    uint256 public constant OFFICIAL_RESELLER_FEE_BPS = 100;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    /// @notice Address that receives the protocol fee share of every secondary sale
    address public protocolTreasury;

    // ---------------------------------------------------------------------
    // Data structures
    // ---------------------------------------------------------------------

    struct DropItem {
        string name;
        string description;
        string imageURI; // data: URI (base64) or hosted URL — see docs/functional-spec.md
        uint256 startPrice;
        uint256 reservePrice;
        uint256 startTime;
        uint256 dropDuration; // seconds
        uint256 totalSupply;
        uint256 sold;
        address officialReseller; // fixed per campaign — receives the 1% resale royalty
    }

    struct ResaleListing {
        uint256 resalePrice;
        address seller;
        bool isActive;
    }

    uint256 public nextDropId;
    uint256 public nextTokenId;

    mapping(uint256 dropId => DropItem) public drops;
    mapping(uint256 tokenId => uint256 dropId) public tokenToDropId;
    mapping(uint256 tokenId => ResaleListing) public listings;
    mapping(address user => uint256 amount) public withdrawable;

    // Frontend convenience — "My Collection" screen (purely informational, no fee logic depends on this)
    mapping(uint256 tokenId => uint256 price) public tokenAcquisitionPrice;
    mapping(uint256 tokenId => uint256 timestamp) public tokenAcquiredAt;

    // ---------------------------------------------------------------------
    // Events — see docs/functional-spec.md §3 for frontend usage
    // ---------------------------------------------------------------------

    event DropCreated(
        uint256 indexed dropId,
        string name,
        address officialReseller,
        uint256 startPrice,
        uint256 reservePrice,
        uint256 totalSupply
    );
    event DropPurchased(address indexed buyer, uint256 indexed dropId, uint256 indexed tokenId, uint256 price);
    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);
    event SecondarySale(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 protocolFee,
        uint256 officialResellerRoyalty
    );
    event TokenBurned(uint256 indexed tokenId, address indexed owner);
    event FundsWithdrawn(address indexed user, uint256 amount);

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(address _protocolTreasury) ERC721("FairDrop", "FAIR") Ownable(msg.sender) {
        require(_protocolTreasury != address(0), "treasury required");
        protocolTreasury = _protocolTreasury;
    }

    // ---------------------------------------------------------------------
    // Admin — campaign creation (see /admin screen in the frontend)
    // ---------------------------------------------------------------------

    /// @notice Creates a new drop campaign. Only callable by the contract owner (the deployer).
    /// @dev The real access control boundary is `onlyOwner` — the frontend `/admin` route check
    ///      is cosmetic (see docs/functional-spec.md §5 "Écran Admin").
    function createDrop(
        string calldata name,
        string calldata description,
        string calldata imageURI,
        uint256 startPrice,
        uint256 reservePrice,
        uint256 dropDuration,
        uint256 totalSupply_,
        address officialReseller
    ) external onlyOwner returns (uint256 dropId) {
        require(startPrice > reservePrice, "startPrice must exceed reservePrice");
        require(dropDuration > 0, "duration must be > 0");
        require(totalSupply_ > 0, "supply must be > 0");
        require(officialReseller != address(0), "officialReseller required");

        dropId = nextDropId++;
        drops[dropId] = DropItem({
            name: name,
            description: description,
            imageURI: imageURI,
            startPrice: startPrice,
            reservePrice: reservePrice,
            startTime: block.timestamp,
            dropDuration: dropDuration,
            totalSupply: totalSupply_,
            sold: 0,
            officialReseller: officialReseller
        });

        emit DropCreated(dropId, name, officialReseller, startPrice, reservePrice, totalSupply_);
    }

    // ---------------------------------------------------------------------
    // Primary market — continuous Dutch Auction
    // ---------------------------------------------------------------------

    /// @notice Current price of a drop, ticking down linearly from startPrice to reservePrice
    ///         over dropDuration seconds, then floored at reservePrice.
    function getCurrentPrice(uint256 dropId) public view returns (uint256) {
        DropItem storage drop = drops[dropId];
        require(drop.startTime != 0, "drop does not exist");

        if (block.timestamp >= drop.startTime + drop.dropDuration) {
            return drop.reservePrice;
        }

        uint256 elapsed = block.timestamp - drop.startTime;
        uint256 priceRange = drop.startPrice - drop.reservePrice;
        uint256 discount = (priceRange * elapsed) / drop.dropDuration;
        return drop.startPrice - discount;
    }

    /// @notice Buys one unit of a drop at the current Dutch Auction price.
    function buyDrop(uint256 dropId) external payable nonReentrant returns (uint256 tokenId) {
        DropItem storage drop = drops[dropId];
        require(drop.startTime != 0, "drop does not exist");
        require(drop.sold < drop.totalSupply, "sold out");

        uint256 price = getCurrentPrice(dropId);
        require(msg.value >= price, "insufficient payment");

        // Checks-Effects-Interactions: update state before any transfer/mint side effect
        drop.sold += 1;
        tokenId = nextTokenId++;
        tokenToDropId[tokenId] = dropId;
        tokenAcquisitionPrice[tokenId] = price;
        tokenAcquiredAt[tokenId] = block.timestamp;

        _safeMint(msg.sender, tokenId);

        // Pull-payment: primary sale proceeds go to the project owner's withdrawable balance
        withdrawable[owner()] += price;

        uint256 excess = msg.value - price;
        if (excess > 0) {
            withdrawable[msg.sender] += excess;
        }

        emit DropPurchased(msg.sender, dropId, tokenId, price);
    }

    // ---------------------------------------------------------------------
    // Secondary market — P2P resale with flat royalty (1% protocol + 1% official reseller)
    // ---------------------------------------------------------------------

    function listForResale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "not token owner");
        require(price > 0, "price must be > 0");
        require(!listings[tokenId].isActive, "already listed");

        listings[tokenId] = ResaleListing({resalePrice: price, seller: msg.sender, isActive: true});

        emit ItemListed(tokenId, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external {
        ResaleListing storage listing = listings[tokenId];
        require(listing.isActive, "no active listing");
        require(listing.seller == msg.sender, "not seller");

        listing.isActive = false;

        emit ListingCancelled(tokenId);
    }

    /// @notice Buys a listed token. Splits the price 1% protocol / 1% official reseller / 98% seller,
    ///         regardless of whether the sale is at a profit or a loss (see docs/functional-spec.md §1).
    function buySecondary(uint256 tokenId) external payable nonReentrant {
        ResaleListing storage listing = listings[tokenId];
        require(listing.isActive, "no active listing");

        uint256 price = listing.resalePrice;
        require(msg.value >= price, "insufficient payment");

        address seller = listing.seller;
        uint256 dropId = tokenToDropId[tokenId];
        address officialReseller = drops[dropId].officialReseller;

        // Checks-Effects-Interactions: close the listing before any transfer
        listing.isActive = false;

        uint256 protocolFee = (price * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 officialResellerRoyalty = (price * OFFICIAL_RESELLER_FEE_BPS) / BPS_DENOMINATOR;
        uint256 sellerAmount = price - protocolFee - officialResellerRoyalty;

        withdrawable[protocolTreasury] += protocolFee;
        withdrawable[officialReseller] += officialResellerRoyalty;
        withdrawable[seller] += sellerAmount;

        tokenAcquisitionPrice[tokenId] = price;
        tokenAcquiredAt[tokenId] = block.timestamp;

        uint256 excess = msg.value - price;
        if (excess > 0) {
            withdrawable[msg.sender] += excess;
        }

        _transfer(seller, msg.sender, tokenId);

        emit SecondarySale(tokenId, seller, msg.sender, price, protocolFee, officialResellerRoyalty);
    }

    // ---------------------------------------------------------------------
    // Burn for delivery
    // ---------------------------------------------------------------------

    /// @notice Burns the token on-chain to symbolize the physical delivery of the sealed item.
    function burnForDelivery(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "not token owner");
        require(!listings[tokenId].isActive, "cancel listing first");

        _burn(tokenId);

        emit TokenBurned(tokenId, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Withdrawals — pull-payment pattern for every party (seller, official reseller, protocol, owner)
    // ---------------------------------------------------------------------

    function withdrawFunds() external nonReentrant {
        uint256 amount = withdrawable[msg.sender];
        require(amount > 0, "nothing to withdraw");

        withdrawable[msg.sender] = 0;

        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "withdraw failed");

        emit FundsWithdrawn(msg.sender, amount);
    }

    function getWithdrawableBalance(address user) external view returns (uint256) {
        return withdrawable[user];
    }

    // ---------------------------------------------------------------------
    // Views — frontend read calls (see docs/functional-spec.md §2)
    // ---------------------------------------------------------------------

    function getDropInfo(uint256 dropId) external view returns (DropItem memory) {
        return drops[dropId];
    }

    function getActiveListing(uint256 tokenId) external view returns (ResaleListing memory) {
        return listings[tokenId];
    }

    /// @notice Returns all tokenIds currently owned by `user`.
    /// @dev O(n) over all minted tokens — acceptable at hackathon MVP scale.
    ///      For production, track an explicit per-owner tokenId array instead.
    function getUserTokens(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        uint256 count = 0;
        for (uint256 i = 0; i < nextTokenId && count < balance; i++) {
            if (_ownerOf(i) == user) {
                tokens[count] = i;
                count++;
            }
        }
        return tokens;
    }

    /// @notice Returns all tokenIds currently listed on the secondary marketplace.
    /// @dev O(n) over all minted tokens — acceptable at hackathon MVP scale.
    function getAllActiveListings() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (listings[i].isActive) count++;
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (listings[i].isActive) {
                result[idx] = i;
                idx++;
            }
        }
        return result;
    }
}
