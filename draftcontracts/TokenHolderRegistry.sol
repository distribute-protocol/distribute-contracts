pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted), ETH pool balance,
  mint, burn prices
*/

contract TokenHolderRegistry{

//state variables
  //TOKEN HOLDER STATE VARIABLES
  struct TokenHolder{
    uint totalTokenBalance;       //total capital tokens of all types
    uint freeTokenBalance;
  }

  address projectRegistry;
  mapping (address => TokenHolder) public balances;

  uint public totalCapitalTokenSupply = 0;               //total supply of capital tokens in all states
  uint public totalFreeCapitalTokenSupply = 0;           //total supply of free capital tokens (not staked, validated, or voted)

  //CONTINUOUS TOKEN STATE VARIABLES --> from Simon's code
  uint public constant MAX_UINT = (2**256) - 1;

  uint256 baseCost = 100000000000000; //100000000000000 wei 0.0001 ether
  uint256 public costPerToken = 0;

  uint256 public poolBalance;   //in Wei

//events

event LogMint(uint256 amountMinted, uint256 totalCost);
event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
event LogCostOfTokenUpdate(uint256 newCost);

//modifiers

//constructor

  function TokenHolderRegistry(address _projectRegistry) {       //contract is created
    updateMintingPrice(0);
    projectRegistry = _projectRegistry;
  }

//functions

  // via: http://ethereum.stackexchange.com/questions/10425/is-there-any-efficient-way-to-compute-the-exponentiation-of-a-fraction-and-an-in/10432#10432
  // Computes `k * (1+1/q) ^ N`, with precision `p`. The higher
  // the precision, the higher the gas cost. It should be
  // something around the log of `n`. When `p == n`, the
  // precision is absolute (sans possible integer overflows).
  // Much smaller values are sufficient to get a great approximation.
  function fracExp(uint k, uint q, uint n, uint p) internal returns (uint) {
    uint s = 0;
    uint N = 1;
    uint B = 1;
    for (uint i = 0; i < p; ++i){
      s += k * N / B / (q**i);
      N  = N * (n-i);
      B  = B * (i+1);
    }
    return s;
  }

  function updateMintingPrice(uint256 _supply) {    //minting price
      costPerToken = baseCost+fracExp(baseCost, 618046, _supply, 2)+baseCost*_supply/1000;
      LogCostOfTokenUpdate(costPerToken);
  }

  function mint(uint256 _amountToMint) payable returns (bool) {
      //balance of msg.sender increases if paid right amount according to protocol

      if(_amountToMint > 0 && (MAX_UINT - _amountToMint) >= totalCapitalTokenSupply && msg.value > 0) {

          uint256 totalMinted = 0;
          uint256 totalCost = 0;
          //for loop to determine cost at each point.
          for(uint i = 0; i < _amountToMint; i+=1) {
              if(totalCost + costPerToken <= msg.value) {
                  totalCost += costPerToken;
                  totalMinted += 1;
                  updateMintingPrice((totalCapitalTokenSupply + i));
              } else {
                  break;
              }
          }

          if(totalCost < msg.value) { //some funds left, not enough for one token. Send back funds
              msg.sender.transfer(msg.value - totalCost);
          }

          totalCapitalTokenSupply += totalMinted;
          balances[msg.sender].totalTokenBalance += totalMinted;
          poolBalance += totalCost;

          LogMint(totalMinted, totalCost);

          return true;
      } else {
          revert();
      }
  }

  function burn(uint256 _amountToBurn) returns (bool) {
      if(_amountToBurn > 0 && (balances[msg.sender].freeTokenBalance) >= _amountToBurn) {
          //CHECK HAS FREE TOKENS
          //determine how much you can leave with.
          uint256 reward = _amountToBurn * poolBalance/totalCapitalTokenSupply; //rounding?
          msg.sender.transfer(reward);
          balances[msg.sender].totalTokenBalance -= _amountToBurn;
          balances[msg.sender].freeTokenBalance -= _amountToBurn;
          totalCapitalTokenSupply -= _amountToBurn;
          totalFreeCapitalTokenSupply -= _amountToBurn;
          updateMintingPrice(totalCapitalTokenSupply);
          LogWithdraw(_amountToBurn, reward);
          return true;
      } else {
          revert();
      }
  }

  function refundProposer(address _proposer, uint _tokens) {
    balances[_proposer].freeTokenBalance += _tokens;
    totalFreeCapitalTokenSupply += _tokens;
    //implement pool reward
  }

  function stakeToken(address _staker, uint _tokens) {
    if (balances[_staker].freeTokenBalance > _tokens) {
      balances[_staker].freeTokenBalance -= _tokens;
      totalFreeCapitalTokenSupply -= _tokens;
    }
  }

  function unstakeToken(address _staker, uint _tokens) {
    if (balances[_staker].totalTokenBalance - balances[_staker].freeTokenBalance < _tokens) {
      balances[_staker].freeTokenBalance += _tokens;
      totalFreeCapitalTokenSupply += _tokens;
    }
  }

  function transfer(address _to, uint256 _amountToTransfer) returns (bool) {
    if(_amountToTransfer > 0 && balances[msg.sender].freeTokenBalance >= _amountToTransfer) {
      balances[msg.sender].totalTokenBalance -= _amountToTransfer;
      balances[msg.sender].freeTokenBalance -= _amountToTransfer;
      balances[_to].totalTokenBalance += _amountToTransfer;
      balances[_to].freeTokenBalance += _amountToTransfer;

    }
    else {
      revert();
    }
  }
}
