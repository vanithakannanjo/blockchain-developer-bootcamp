//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange{
	address public feeAccount;
	uint256 public feePercent;
	mapping(address => mapping(address=>uint256)) public tokens;
	mapping(uint256 => _Order)public orders;
	uint256 public orderCount;
	mapping(uint256 => bool) public orderCancelled; // orderid => true/false

	event Deposit(
		address token, 
		address user, 
		uint256 amount, 
		uint256 balance
	);
	event Withdraw(
		address token,
		address user, 
		uint256 amount, 
		uint256 balance
	);
	event Order(
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive, 
		uint256 amountGive,
		uint256 timestamp
	
	);
	event Cancel(
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive, 
		uint256 amountGive,
		uint256 timestamp
	
	);

	

	struct _Order{
		//Atributes of the order
		uint256 id;// unique id for order
		address user;//user who make order
		address tokenGet; //address of the token they receive
		uint256 amountGet;//amount they receive
		address tokenGive;//address of the token they give 
		uint256 amountGive;//amount they give
		uint256 timestamp;//when order was created 
	}

	constructor(address _feeAccount, uint256 _feePercent){
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}


    // ------------------------
    // DEPOSIT & WITHDRAW TOKEN

    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

	function withdrawToken(address _token,uint256 _amount)public{
		require(tokens[_token][msg.sender] >= _amount);
		Token(_token).transfer(msg.sender,_amount);
		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);

	}

	function balanceOf(address _token, address _user)
	public
	view
	returns(uint256)
	{
		return tokens[_token][_user];
	
	}

	//--------------------------
	// MAKE ORDER
	function makeOrder(
		address _tokenGet, 
		uint256 _amountGet,
		address _tokenGive, 
		uint256 _amountGive
	) public {
		orderCount = orderCount + 1;
		orders[orderCount] = _Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);

		emit Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);
		
	}



	function cancelOrder(
		uint256 _id
	)public{
		//Fetch order
		_Order storage _order = orders[_id];
		
		require(address(_order.user) == msg.sender);

		//Cancel order
		orderCancelled[_id]=true;

		

		//emit
		emit Cancel (
			_order.id,
			msg.sender,
			_order.tokenGet,
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive,
			block.timestamp
		);

	}



	//Executing Orders 
	function fillOrder(uint256 _id)public{
		_Order storage _order = orders[_id];

		_trade(
			_order.id, 
			_order.user,
			_order.tokenGet, 
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive
		);
	}
	

	function _trade(
		uint256 _orderId, 
		address _user, 
		address _tokenGet, 
		uint256 _amountGet,
		address _tokenGive, 
		uint256 _amountGive
	) internal{

		uint256 _feeAmount = (_amountGet * feePercent)/100;

		tokens[_tokenGet][msg.sender]= 
			tokens[_tokenGet][msg.sender] - 
			(_amountGet + _feeAmount);

		tokens[_tokenGet][_user]=tokens[_tokenGet][_user] +  _amountGet;

		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

		tokens[_tokenGive][_user]=tokens[_tokenGive][_user] -  _amountGive;

		tokens[_tokenGive][msg.sender]= 
			tokens[_tokenGive][msg.sender] + 
			_amountGive;
		


	}
}