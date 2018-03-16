pragma solidity ^0.4.8;

import "./library/StandardToken.sol";
import "./library/SafeMath.sol";
import "./library/Division.sol";

contract DistributeToken is StandardToken {

  using SafeMath for uint256;

  address tokenRegistryAddress;
  address reputationRegistryAddress;

  string public constant symbol = "DST";
  string public constant name = "Distributed Utility Token";
  uint8 public constant decimals = 18;

  uint256 public totalSupply = 0;               //total supply of capital tokens in all staking states

  uint256 public weiBal;

  // .0001 ether
  uint256 baseCost = 50000000000000;

// =====================================================================
// EVENTS
// =====================================================================

  event LogMint(uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(uint256 amountWithdrawn, uint256 reward);

// =====================================================================
// CONSTRUCTOR
// =====================================================================

  function DistributeToken(address _tokenRegistry, address _reputationRegistry) public {
    require(tokenRegistryAddress == 0 && reputationRegistryAddress == 0);
    tokenRegistryAddress = _tokenRegistry;
    reputationRegistryAddress = _reputationRegistry;
  }

// =====================================================================
// MODIFIERS
// =====================================================================

  modifier onlyTR() {
    require(msg.sender == tokenRegistryAddress);
    _;
  }

  modifier onlyTRorRR() {
    require(msg.sender == tokenRegistryAddress || msg.sender == reputationRegistryAddress);
    _;
  }

// =====================================================================
// FUNCTIONS
// =====================================================================

  // =====================================================================
  // UTILITY
  // =====================================================================

  function currentPrice() public view returns (uint256) {
    //calculated current burn reward of 1 token at current weiBal and free token supply
    if (weiBal == 0 || totalSupply == 0) { return baseCost; }
    return weiBal / totalSupply;
  }

  function weiRequired(uint256 _tokens) public view returns (uint256) {
    require(_tokens > 0);
    return targetPrice(_tokens) *  _tokens;
  }

  function targetPrice(uint _tokens) public view returns (uint256) {
    require(_tokens > 0);
    uint256 cp = currentPrice();
    uint256 newSupply = totalSupply + _tokens;
    return cp * (1000 + Division.percent(_tokens, newSupply, 3)) / 1000;
  }
  // =====================================================================
  // TOKEN
  // =====================================================================

    function mint(uint _tokens) public payable {
        uint256 weiRequiredVal = weiRequired(_tokens);
        require(msg.value >= weiRequiredVal);
        totalSupply += _tokens;
        balances[msg.sender] += _tokens;
        weiBal += weiRequiredVal;
        LogMint(_tokens, weiRequiredVal);
        uint256 fundsLeft = msg.value - weiRequiredVal;
        if (fundsLeft > 0) {
          msg.sender.transfer(fundsLeft);
        }
    }

    function burn(uint256 _numTokens) public onlyTR {
      require(_numTokens <= totalSupply && _numTokens > 0);
      totalSupply -= _numTokens;
    }

    function sell(uint256 _numTokens) public {
        require(_numTokens > 0 && (_numTokens <= balances[msg.sender]));
        uint256 weiVal = _numTokens * currentPrice();    //truncation - remainder discarded
        balances[msg.sender] -= _numTokens;
        totalSupply = totalSupply.sub(_numTokens);
        weiBal -= weiVal;
        LogWithdraw(_numTokens, weiVal);
        msg.sender.transfer(weiVal);
    }

  // =====================================================================
  // TRANSFER
  // =====================================================================

    function transferWeiTo(address _address, uint256 _weiValue) public onlyTRorRR {
      require(_weiValue <= weiBal);
      weiBal -= _weiValue;
      _address.transfer(_weiValue);
    }

    // THIS IS A DANGEROUS FUNCTION - ONLY TO BE USED FOR EASE OF TESTING

    function returnWei(uint value) public onlyTR {
      weiBal += value;
    }

    function transferToEscrow(address _owner, uint256 _value) public onlyTR returns (bool) {
      require(balances[_owner] >= _value);
      balances[_owner] -= _value;
      balances[msg.sender] += _value;
      return true;
    }

    function transferFromEscrow(address _owner, uint256 _value) public onlyTR returns (bool) {
      require(balances[msg.sender] >= _value);
      balances[msg.sender] -= _value;
      balances[_owner] += _value;
      return true;
    }

  function() public payable {}
}
