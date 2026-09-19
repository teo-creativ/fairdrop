export const fairDropAbi = [
  {
    "type": "constructor",
    "inputs": [{ "name": "_protocolTreasury", "type": "address", "internalType": "address" }],
    "stateMutability": "nonpayable"
  },
  { "type": "function", "name": "BPS_DENOMINATOR", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "OFFICIAL_RESELLER_FEE_BPS", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "PROTOCOL_FEE_BPS", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "approve", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "balanceOf", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "burnForDelivery", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "buyDrop", "inputs": [{ "name": "dropId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "stateMutability": "payable" },
  { "type": "function", "name": "buySecondary", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "payable" },
  { "type": "function", "name": "cancelListing", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  {
    "type": "function", "name": "createDrop",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" },
      { "name": "imageURI", "type": "string", "internalType": "string" },
      { "name": "startPrice", "type": "uint256", "internalType": "uint256" },
      { "name": "reservePrice", "type": "uint256", "internalType": "uint256" },
      { "name": "dropDuration", "type": "uint256", "internalType": "uint256" },
      { "name": "totalSupply_", "type": "uint256", "internalType": "uint256" },
      { "name": "officialReseller", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "dropId", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function", "name": "drops",
    "inputs": [{ "name": "dropId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" },
      { "name": "imageURI", "type": "string", "internalType": "string" },
      { "name": "startPrice", "type": "uint256", "internalType": "uint256" },
      { "name": "reservePrice", "type": "uint256", "internalType": "uint256" },
      { "name": "startTime", "type": "uint256", "internalType": "uint256" },
      { "name": "dropDuration", "type": "uint256", "internalType": "uint256" },
      { "name": "totalSupply", "type": "uint256", "internalType": "uint256" },
      { "name": "sold", "type": "uint256", "internalType": "uint256" },
      { "name": "officialReseller", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function", "name": "getActiveListing",
    "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{
      "name": "", "type": "tuple", "internalType": "struct FairDrop.ResaleListing",
      "components": [
        { "name": "resalePrice", "type": "uint256", "internalType": "uint256" },
        { "name": "seller", "type": "address", "internalType": "address" },
        { "name": "isActive", "type": "bool", "internalType": "bool" }
      ]
    }],
    "stateMutability": "view"
  },
  { "type": "function", "name": "getAllActiveListings", "inputs": [], "outputs": [{ "name": "", "type": "uint256[]", "internalType": "uint256[]" }], "stateMutability": "view" },
  { "type": "function", "name": "getApproved", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "getCurrentPrice", "inputs": [{ "name": "dropId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  {
    "type": "function", "name": "getDropInfo",
    "inputs": [{ "name": "dropId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{
      "name": "", "type": "tuple", "internalType": "struct FairDrop.DropItem",
      "components": [
        { "name": "name", "type": "string", "internalType": "string" },
        { "name": "description", "type": "string", "internalType": "string" },
        { "name": "imageURI", "type": "string", "internalType": "string" },
        { "name": "startPrice", "type": "uint256", "internalType": "uint256" },
        { "name": "reservePrice", "type": "uint256", "internalType": "uint256" },
        { "name": "startTime", "type": "uint256", "internalType": "uint256" },
        { "name": "dropDuration", "type": "uint256", "internalType": "uint256" },
        { "name": "totalSupply", "type": "uint256", "internalType": "uint256" },
        { "name": "sold", "type": "uint256", "internalType": "uint256" },
        { "name": "officialReseller", "type": "address", "internalType": "address" }
      ]
    }],
    "stateMutability": "view"
  },
  { "type": "function", "name": "getUserTokens", "inputs": [{ "name": "user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256[]", "internalType": "uint256[]" }], "stateMutability": "view" },
  { "type": "function", "name": "getWithdrawableBalance", "inputs": [{ "name": "user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "isApprovedForAll", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "operator", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" },
  { "type": "function", "name": "listForResale", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "price", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  {
    "type": "function", "name": "listings",
    "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "resalePrice", "type": "uint256", "internalType": "uint256" },
      { "name": "seller", "type": "address", "internalType": "address" },
      { "name": "isActive", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  { "type": "function", "name": "name", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" },
  { "type": "function", "name": "nextDropId", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "nextTokenId", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "ownerOf", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "protocolTreasury", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "renounceOwnership", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "safeTransferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "safeTransferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "data", "type": "bytes", "internalType": "bytes" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "setApprovalForAll", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }, { "name": "approved", "type": "bool", "internalType": "bool" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "supportsInterface", "inputs": [{ "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" },
  { "type": "function", "name": "symbol", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" },
  { "type": "function", "name": "tokenAcquiredAt", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "timestamp", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "tokenAcquisitionPrice", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "price", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "tokenToDropId", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "dropId", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "tokenURI", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" },
  { "type": "function", "name": "transferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "transferOwnership", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "withdrawFunds", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "withdrawable", "inputs": [{ "name": "user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "event", "name": "Approval", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "approved", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "ApprovalForAll", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "operator", "type": "address", "indexed": true, "internalType": "address" }, { "name": "approved", "type": "bool", "indexed": false, "internalType": "bool" }], "anonymous": false },
  {
    "type": "event", "name": "DropCreated",
    "inputs": [
      { "name": "dropId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "name", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "officialReseller", "type": "address", "indexed": false, "internalType": "address" },
      { "name": "startPrice", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "reservePrice", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "totalSupply", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event", "name": "DropPurchased",
    "inputs": [
      { "name": "buyer", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "dropId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "price", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  { "type": "event", "name": "FundsWithdrawn", "inputs": [{ "name": "user", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "ItemListed", "inputs": [{ "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "seller", "type": "address", "indexed": true, "internalType": "address" }, { "name": "price", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "ListingCancelled", "inputs": [{ "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false },
  {
    "type": "event", "name": "SecondarySale",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "seller", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "buyer", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "price", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "protocolFee", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "officialResellerRoyalty", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  { "type": "event", "name": "TokenBurned", "inputs": [{ "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "owner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false },
  { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true, "internalType": "address" }, { "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false },
  { "type": "error", "name": "ERC721IncorrectOwner", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "owner", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ERC721InsufficientApproval", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }] },
  { "type": "error", "name": "ERC721InvalidApprover", "inputs": [{ "name": "approver", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ERC721InvalidOperator", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ERC721InvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ERC721InvalidReceiver", "inputs": [{ "name": "receiver", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ERC721InvalidSender", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ERC721NonexistentToken", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }] },
  { "type": "error", "name": "OwnableInvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "OwnableUnauthorizedAccount", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }] },
  { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] }
] as const;

// TODO : remplace par ta vraie adresse déployée
export const fairDropAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;