// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FairDrop.sol";

contract FairDropTest is Test {
    FairDrop public fairDrop;

    address owner = address(this);
    address treasury = address(0x7EA5); // protocol treasury
    address officialReseller = address(0xB12AD); // brand/franchise address for the test drop
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    uint256 dropId;

    receive() external payable {}

    function setUp() public {
        fairDrop = new FairDrop(treasury);

        dropId = fairDrop.createDrop(
            "30th Anniversary Elite Trainer Gift Set",
            "The Pokemon TCG 30th Anniversary Elite Trainer Box",
            "https://example.com/image.png",
            100 ether, // startPrice
            10 ether, // reservePrice
            300, // dropDuration (seconds)
            5, // totalSupply
            officialReseller
        );

        vm.deal(alice, 1_000 ether);
        vm.deal(bob, 1_000 ether);
    }

    // --- Dutch Auction pricing ---

    function test_PriceStartsAtStartPrice() public view {
        assertEq(fairDrop.getCurrentPrice(dropId), 100 ether);
    }

    function test_PriceDecreasesLinearlyOverTime() public {
        vm.warp(block.timestamp + 150); // halfway through the 300s drop
        // startPrice - (startPrice - reservePrice) * 0.5 = 100 - 45 = 55
        assertEq(fairDrop.getCurrentPrice(dropId), 55 ether);
    }

    function test_PriceFloorsAtReservePrice() public {
        vm.warp(block.timestamp + 10_000); // long after dropDuration
        assertEq(fairDrop.getCurrentPrice(dropId), 10 ether);
    }

    // --- Primary market ---

    function test_BuyDropMintsTokenAndDecrementsStock() public {
        vm.warp(block.timestamp + 300); // reserve price = 10 ether
        vm.prank(alice);
        uint256 tokenId = fairDrop.buyDrop{value: 10 ether}(dropId);

        assertEq(fairDrop.ownerOf(tokenId), alice);
        assertEq(fairDrop.getDropInfo(dropId).sold, 1);
        assertEq(fairDrop.getWithdrawableBalance(owner), 10 ether);
    }

    function test_BuyDropRefundsExcessPayment() public {
        vm.warp(block.timestamp + 300); // reserve price = 10 ether
        vm.prank(alice);
        fairDrop.buyDrop{value: 15 ether}(dropId);

        assertEq(fairDrop.getWithdrawableBalance(alice), 5 ether);
    }

    function test_BuyDropRevertsWhenSoldOut() public {
        vm.warp(block.timestamp + 300);
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(alice);
            fairDrop.buyDrop{value: 10 ether}(dropId);
        }

        vm.prank(bob);
        vm.expectRevert("sold out");
        fairDrop.buyDrop{value: 10 ether}(dropId);
    }

    function test_BuyDropRevertsOnInsufficientPayment() public {
        vm.prank(alice);
        vm.expectRevert("insufficient payment");
        fairDrop.buyDrop{value: 1 ether}(dropId);
    }

    // --- Secondary market ---

    function _buyOneAsAlice() internal returns (uint256 tokenId) {
        vm.warp(block.timestamp + 300); // 10 ether
        vm.prank(alice);
        tokenId = fairDrop.buyDrop{value: 10 ether}(dropId);
    }

    function test_ListForResaleAndCancel() public {
        uint256 tokenId = _buyOneAsAlice();

        vm.prank(alice);
        fairDrop.listForResale(tokenId, 20 ether);
        (uint256 price, address seller, bool isActive) = fairDrop.listings(tokenId);
        assertEq(price, 20 ether);
        assertEq(seller, alice);
        assertTrue(isActive);

        vm.prank(alice);
        fairDrop.cancelListing(tokenId);
        (,, bool isActiveAfter) = fairDrop.listings(tokenId);
        assertFalse(isActiveAfter);
    }

    function test_BuySecondarySplitsFeeCorrectly() public {
        uint256 tokenId = _buyOneAsAlice();

        vm.prank(alice);
        fairDrop.listForResale(tokenId, 20 ether); // resale, at a profit

        vm.prank(bob);
        fairDrop.buySecondary{value: 20 ether}(tokenId);

        // 1% protocol + 1% official reseller + 98% seller
        assertEq(fairDrop.getWithdrawableBalance(treasury), 0.2 ether);
        assertEq(fairDrop.getWithdrawableBalance(officialReseller), 0.2 ether);
        assertEq(fairDrop.getWithdrawableBalance(alice), 19.6 ether);
        assertEq(fairDrop.ownerOf(tokenId), bob);
    }

    function test_BuySecondaryAppliesFeeEvenAtALoss() public {
        uint256 tokenId = _buyOneAsAlice();

        vm.prank(alice);
        fairDrop.listForResale(tokenId, 5 ether); // resale, at a loss vs. the 10 ether paid

        vm.prank(bob);
        fairDrop.buySecondary{value: 5 ether}(tokenId);

        assertEq(fairDrop.getWithdrawableBalance(treasury), 0.05 ether);
        assertEq(fairDrop.getWithdrawableBalance(officialReseller), 0.05 ether);
        assertEq(fairDrop.getWithdrawableBalance(alice), 4.9 ether);
    }

    // --- Burn for delivery ---

    function test_BurnForDelivery() public {
        uint256 tokenId = _buyOneAsAlice();

        vm.prank(alice);
        fairDrop.burnForDelivery(tokenId);

        vm.expectRevert();
        fairDrop.ownerOf(tokenId);
    }

    function test_CannotBurnWhileListed() public {
        uint256 tokenId = _buyOneAsAlice();

        vm.prank(alice);
        fairDrop.listForResale(tokenId, 20 ether);

        vm.prank(alice);
        vm.expectRevert("cancel listing first");
        fairDrop.burnForDelivery(tokenId);
    }

    // --- Withdrawals ---

    function test_WithdrawFunds() public {
        _buyOneAsAlice();
        uint256 balanceBefore = owner.balance;

        fairDrop.withdrawFunds();

        assertEq(owner.balance, balanceBefore + 10 ether);
        assertEq(fairDrop.getWithdrawableBalance(owner), 0);
    }

    function test_WithdrawFundsRevertsWithNothingToWithdraw() public {
        vm.prank(bob);
        vm.expectRevert("nothing to withdraw");
        fairDrop.withdrawFunds();
    }
}
