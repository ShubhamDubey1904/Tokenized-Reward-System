// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Phillip Reward Token (PRT)
/// @notice Fixed-supply ERC20; owner can reward users by transferring from the owner's balance.
contract RewardToken is ERC20, ERC20Permit, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;

    event Rewarded(address indexed user, uint256 amount);

    constructor()
        ERC20("Phillip Reward Token", "PRT")
        ERC20Permit("Phillip Reward Token")
        Ownable(msg.sender)
    {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /// @notice Owner-only reward: transfer from owner's balance (no minting).
    function rewardUser(address user, uint256 amount) external onlyOwner {
        _transfer(msg.sender, user, amount);
        emit Rewarded(user, amount);
    }
}
