// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract WEth {
    error WETH__InsufficientBalance(address from, uint256 fromBalance, uint256 value);
    error WETH__InvalidSender(address from);
    error WETH__InvalidReceiver(address to);
    error WETH__InvalidSpender(address to);
    error WETH__EthValueMustMoreThanZero();

    mapping(address account => uint256) private _balances;
    mapping(address account => mapping(address spender => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    event Transfer(address indexed from, address indexed to, uint256 indexed value);
    event Approval(address indexed owner, address indexed spender, uint256 indexed value);

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function deposit() public payable returns (bool) {
        if (msg.value == 0) {
            revert WETH__EthValueMustMoreThanZero();
        }
        _update(address(0), msg.sender, msg.value);
        return true;
    }

    function withdraw(uint256 value) public returns (bool) {
        uint256 balance = _balances[msg.sender];
        if (balance < value) {
            revert WETH__InsufficientBalance(msg.sender, balance, value);
        }
        _update(msg.sender, address(0), value);
        payable(msg.sender).transfer(value);
        return true;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        if (to == address(0)) {
            revert WETH__InvalidReceiver(address(0));
        } else {
            _update(msg.sender, to, value);
        }
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        if (from == address(0)) {
            revert WETH__InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert WETH__InvalidReceiver(address(0));
        }
        _update(from, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        if (spender == address(0)) {
            revert WETH__InvalidSpender(address(0));
        } else {
            if (_balances[msg.sender] < value) {
                revert WETH__InsufficientBalance(msg.sender, _balances[msg.sender], value);
            } else {
                _allowances[msg.sender][spender] = value;
            }
        }
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function _update(address from, address to, uint256 value) private {
        if (from == address(0)) {
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert WETH__InsufficientBalance(from, fromBalance, value);
            } else {
                unchecked {
                    _balances[from] -= value;
                }
            }
        }

        if (to == address(0)) {
            _totalSupply -= value;
        } else {
            _balances[to] += value;
        }
        emit Transfer(from, to, value);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
}
