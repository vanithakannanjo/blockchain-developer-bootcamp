//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Exchange{
	address public feeAccount;

	constructor(address _feeAccount){
		feeAccount = _feeAccount;
	}

}