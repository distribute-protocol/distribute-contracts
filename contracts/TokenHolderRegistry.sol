pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ProjectRegistry.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted), ETH pool balance,
  mint, burn prices
*/

//FIGURE OUT HOW TO INTEGRATE CONTINUOUS TOKEN HERE

contract TokenHolderRegistry{

//state variables
  //TOKEN HOLDER STATE VARIABLES
  struct TokenHolder{
    uint totalTokenBalance;       //total capital tokens of all types
    uint proposedTokenBalance;    //tokens held in escrow for proposed projects
    uint stakedTokenBalance;      //tokens staked on proposed/active projects
    uint validatedTokenBalance;   //tokens staked on a validation state of a complete project
    uint votedTokenBalance;       //tokens held in escrow for voting on a complete project
  }

  address projectRegistry;
  mapping (address => TokenHolder) public balances;
  uint public totalCapitalTokenSupply;               //total supply of capital tokens in all states
  uint public totalFreeCapitalTokenSupply;           //total supply of free capital tokens (not staked, validated, or voted)

  //CONTINUOUS TOKEN STATE VARIABLES --> from Simon's code
  uint public constant MAX_UINT = (2**256) - 1;

  uint256 baseCost = 100000000000000; //100000000000000 wei 0.0001 ether
  uint256 public costPerToken = 0;

  uint256 public totalEverMinted;
  uint256 public totalEverWithdrawn;
  uint256 public poolBalance;

  uint8 decimals;
  string symbol;
  string name;


//events

event LogMint(uint256 amountMinted, uint256 totalCost);
event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
event LogCostOfTokenUpdate(uint256 newCost);

//modifiers

//constructor

  function TokenHolderRegistry(address _projectRegistry, address _firstTokenHolder, uint _initialBalance) {       //contract is created when the first token is minted
    updateMintingPrice(0);
    projectRegistry = _projectRegistry;
    balances[_firstTokenHolder] = TokenHolder(_initialBalance, 0, 0, 0, 0);
    totalCapitalTokenSupply = _initialBalance;
    totalFreeCapitalTokenSupply = _initialBalance;
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

  function updateMintingPrice(uint256 _supply) internal {    //minting price
      costPerToken = baseCost+fracExp(baseCost, 618046, _supply, 2)+baseCost*_supply/1000;
      LogCostOfTokenUpdate(costPerToken);
  }

  function mint(uint256 _amountToMint) payable returns (bool) {
      //balance of msg.sender increases if paid right amount according to protocol

      if(_amountToMint > 0 && (MAX_UINT - _amountToMint) >= totalSupply && msg.value > 0) {

          uint256 totalMinted = 0;
          uint256 totalCost = 0;
          //for loop to determine cost at each point.
          for(uint i = 0; i < _amountToMint; i+=1) {
              if(totalCost + costPerToken <= msg.value) {
                  totalCost += costPerToken;
                  totalMinted += 1;
                  updateMintingPrice((totalSupply+i));
              } else {
                  break;
              }
          }

          if(totalCost < msg.value) { //some funds left, not enough for one token. Send back funds
              msg.sender.transfer(msg.value - totalCost);
          }

          totalEverMinted += totalMinted;
          totalSupply += totalMinted;
          balances[msg.sender] += totalMinted;
          poolBalance += totalCost;

          LogMint(totalMinted, totalCost);

          return true;
      } else {
          revert();
      }
  }

  function withdraw(uint256 _amountToWithdraw) returns (bool) {
      if(_amountToWithdraw > 0 && balances[msg.sender] >= _amountToWithdraw) {
          //determine how much you can leave with.
          uint256 reward = _amountToWithdraw * poolBalance/totalSupply; //rounding?
          msg.sender.transfer(reward);
          balances[msg.sender] -= _amountToWithdraw;
          totalSupply -= _amountToWithdraw;
          updateMintingPrice(totalSupply);
          LogWithdraw(_amountToWithdraw, reward);
          return true;
      } else {
          revert();
      }
  }

  function transfer(address _to) {

  }

}
