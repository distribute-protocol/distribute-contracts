pragma solidity ^0.4.8;

import "./library/StandardToken.sol";
import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";

contract DistributeToken is StandardToken {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  /*address trAddress;*/

  string public constant symbol = "DST";
  string public constant name = "Distributed Utility Token";
  uint8 public constant decimals = 18;

  uint256 public totalSupply = 0;               //total supply of capital tokens in all staking states

  uint256 public weiBal;

  // .0001 ether --> 3 cents
  uint256 baseCost = 100000000000000;

 // =====================================================================
 // EVENTS
 // =====================================================================

   event LogMint(uint256 amountMinted, uint256 totalCost);
   event LogWithdraw(uint256 amountWithdrawn, uint256 reward);

   // =====================================================================
   // CONSTRUCTOR
   // =====================================================================
   function DistributeToken(address _tokenRegistry, address _reputationRegistry) public {
     require(address(tokenRegistry) == 0 && address(reputationRegistry) == 0);
     tokenRegistry = TokenRegistry(_tokenRegistry);
     reputationRegistry = ReputationRegistry(_reputationRegistry);

   }
   // =====================================================================
   // MODIFIERS
   // =====================================================================

   modifier onlyTR() {
     require(msg.sender == address(tokenRegistry));
     _;
   }
  modifier onlyTRorRR() {
    require(msg.sender == address(tokenRegistry) || msg.sender == address(reputationRegistry));
    _;
   }
  // =====================================================================
  // TOKEN FUNCTIONS
  // =====================================================================

  function mint(uint _tokens) public payable {
      /*
        if total supply is 0 or the currentPrice is 0
        return the baseCost, otherwise return the calculated
        targetPrice (handled by targetPrice function).
      */

      // calculate the amount of wei required to create the tokens
      uint256 weiRequiredVal = weiRequired(_tokens);
      require(msg.value >= weiRequiredVal);

      totalSupply += _tokens;
      balances[msg.sender] += _tokens;

      weiBal += weiRequiredVal;
      LogMint(_tokens, weiRequiredVal);

      // return any excess ether as change in wei
      uint256 fundsLeft = msg.value - weiRequiredVal;
      if (fundsLeft > 0) {
        msg.sender.transfer(fundsLeft);
      }
  }

  function burn(uint256 _value) public onlyTR() {
    require(_value <= totalSupply && _value > 0);
    totalSupply -= _value;
  }

  function sell(uint256 _value) public {      //free tokens only
      require(_value > 0 && (balances[msg.sender]) >= _value);
      //determine how much you can leave with.
      uint256 reward = _value * currentPrice();    //truncation - remainder discarded
      balances[msg.sender] -= _value;
      totalSupply -= _value;
      weiBal -= reward;
      LogWithdraw(_value, reward);
      msg.sender.transfer(reward);
  }
  // =====================================================================
  // TRANSFER FUNCTIONS
  // =====================================================================

  function transferWeiTo(address _address, uint256 _weiValue) public onlyTRorRR() {
    require(_weiValue <= weiBal);
    weiBal -= _weiValue;
    _address.transfer(_weiValue);
  }

  // THIS IS A DANGEROUS FUNCTION - ONLY TO BE USED FOR EASE OF TESTING
  function fund() public payable {
    weiBal += msg.value;
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

  // =====================================================================
  // INFO FUNCTIONS
  // =====================================================================

  function currentPrice() public view returns (uint256) {
    //calculated current burn reward of 1 token at current weiBal and free token supply
    if (weiBal == 0) { return baseCost; }
    return weiBal / totalSupply;
  }

  // =====================================================================
  // UTILITY FUNCTIONS
  // =====================================================================

  function percent(uint256 numerator, uint256 denominator, uint256 precision) internal pure returns (uint256) {
     // caution, check safe-to-multiply here
    uint256 _numerator  = numerator * 10 ** (precision+1);
    // with rounding of last digit
    return ((_numerator / denominator) + 5) / 10;
  }

  function weiRequired(uint256 _tokens) public view returns (uint256) {
    require(_tokens > 0);
    return targetPrice(_tokens) *  _tokens;
  }

  function targetPrice(uint _tokens) public view returns (uint256) {
    require(_tokens > 0);
    if (totalSupply == 0 || weiBal == 0) {
      return baseCost;
    }
    uint256 newSupply = totalSupply + _tokens;
    uint256 cp = currentPrice();
    return cp * (1000 + percent(_tokens, newSupply, 3)) / 1000;
  }

  function() public payable {}
}
