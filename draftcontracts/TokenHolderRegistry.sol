pragma solidity ^0.4.10;

//import files
import "./Project.sol";
import "./ERC20.sol";

/*
  keeps track of token holder capital token balances of all
  states (free, staked, validated, voted), ETH pool balance,
  mint, burn prices
*/

contract TokenHolderRegistry is ERC20 {

//state variables --> note: balances are held in ERC20 contract
  //general token holder state variables
  uint public totalCapitalTokenSupply = 0;               //total supply of capital tokens in all staking states
  uint public totalFreeCapitalTokenSupply = 0;           //total supply of free capital tokens (not staked, validated, or voted)
  mapping(address => bool) projectExists;   //combine with proposers bc if project exists, so does proposer
  mapping(uint => address) projectId;

 //proposer state variables
  mapping(address => Proposer) proposers;   //project -> Proposer
  bool initialized = false;
  uint proposePercent = 20;     //hardcoded for now
  struct Proposer{
    address proposer;   //who is the proposer
    uint proposerStake; //how much did they stake in tokens
  }

  //minting & burning state variables --> from Simon's code
  uint public constant MAX_UINT = (2**256) - 1;
  uint256 baseCost = 100000000000000; //100000000000000 wei 0.0001 ether
  uint256 public costPerToken = 0;      //current minting price
  uint256 public ethBal;   //in Wei

//events
event LogMint(uint256 amountMinted, uint256 totalCost);
event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
event LogCostOfTokenUpdate(uint256 newCost);

//modifiers

//constructor
  function TokenHolderRegistry() {       //contract is created
    updateMintingPrice(0);
  }

//functions
  function fracExp(uint k, uint q, uint n, uint p) internal returns (uint) {
    // via: http://ethereum.stackexchange.com/questions/10425/is-there-any-efficient-way-to-compute-the-exponentiation-of-a-fraction-and-an-in/10432#10432
    // Computes `k * (1+1/q) ^ N`, with precision `p`. The higher
    // the precision, the higher the gas cost. It should be
    // something around the log of `n`. When `p == n`, the
    // precision is absolute (sans possible integer overflows).
    // Much smaller values are sufficient to get a great approximation.
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

  function mint() payable {   //fix this function, make ether payable, not tokens
      //balance of msg.sender increases if paid right amount according to protocol
      //will mint as many tokens as it can depending on msg.value and MAX_UINT
      uint256 totalMinted = 0;
      uint256 fundsLeft = msg.value;
      while(fundsLeft >= costPerToken) {   //check to see how many whole tokens can be minted
        if (totalCapitalTokenSupply += totalMinted < MAX_UINT) {
          fundsLeft -= costPerToken;     //subtract token cost from amount paid
          totalMinted += 1;          //update the amount of tokens minted
          updateMintingPrice((totalCapitalTokenSupply + totalMinted));  //update costPerToken
        }
        else{
          break; // token supply hit maximum value
        }
      }
      //leaves loop when not enough eth to buy another whole token
      if(fundsLeft > 0) { //some funds left, not enough for one token. Send back funds
          msg.sender.transfer(fundsLeft);
      }
      totalCapitalTokenSupply += totalMinted;
      totalFreeCapitalTokenSupply += totalMinted;
      balances[msg.sender] += totalMinted;
      ethBal += msg.value - fundsLeft;
      LogMint(totalMinted, msg.value - fundsLeft);
    }

  function burnAndRefund(uint256 _amountToBurn) returns (bool) {
      if(_amountToBurn > 0 && (balances[msg.sender]) >= _amountToBurn) {
          //CHECK HAS FREE TOKENS
          //determine how much you can leave with.
          uint256 reward = _amountToBurn * ethBal/totalCapitalTokenSupply; //rounding?
          msg.sender.transfer(reward);
          balances[msg.sender] -= _amountToBurn;
          totalCapitalTokenSupply -= _amountToBurn;
          totalFreeCapitalTokenSupply -= _amountToBurn;
          updateMintingPrice(totalCapitalTokenSupply);
          LogWithdraw(_amountToBurn, reward);
          return true;
      } else {
          revert();
      }
  }

  function proposeProject(uint _cost, uint _projectDeadline) {    //cost in tokens
    uint proposalProportion = _cost - 1;    //for now, needs to be division in the future
    //check to make sure msg.sender has enough tokens
    Project newProject = new Project(_cost,
                                     _projectDeadline
                                     );
    address projectAddress = address(newProject);
    projectExists[projectAddress] = true;
    proposers[projectAddress] = msg.sender;
    proposerStakes[projectAddress] = proposalProportion;
  }

  function refundProposer(address _proposer, uint _tokens) {
    balances[_proposer] += _tokens;
    totalFreeCapitalTokenSupply += _tokens;
    //figure out how to implement pool reward
  }

/////////////////STAKING NEEDS TO BE FIXED/////////////////
//purpose of stake & unstake is to update balances mapping
  function stakeToken(address _staker, uint _tokens) {    //not good right now, anyone can call
    if (balances[_staker] > _tokens) {
      balances[_staker] -= _tokens;
      totalFreeCapitalTokenSupply -= _tokens;
    }
  }

  function unstakeToken(address _staker, uint _tokens) {    //not good right now, anyone can call
    balances[_staker] += _tokens;                   //assumes _staker has staked to begin with
    totalFreeCapitalTokenSupply += _tokens;
  }
  /////////////////////////////////////////////////////////
}
