pragma solidity ^0.4.10;

import "./TokenRegistry.sol";
import "./ReputationRegistry.sol";
import "./ProjectRegistry.sol";
import "./DistributeToken.sol";

contract Project {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;
  ProjectRegistry projectRegistry;
  DistributeToken distributeToken;
  uint256 state;
  uint256 public weiBal;
  uint256 nextDeadline;
  //set by proposer, total cost of project in ETH, to be fulfilled by capital token holders
  uint256 public weiCost;
  //total amount of staked worker tokens needed, TBD
  uint256 reputationCost;

  uint256 totalTokensStaked;           //amount of capital tokens currently staked
  uint256 totalReputationStaked;            //amount of worker tokens currently staked
  mapping (address => uint) stakedTokenBalances;
  mapping (address => uint) stakedReputationBalances;

  struct Validator {
    uint256 status;
    uint256 stake;
  }
 bool validateFlag = false;
 uint256 validateReward;

  mapping (address => Validator) validators;
  uint256 totalValidateAffirmative;
  uint256 totalValidateNegative;

  modifier onlyInState(uint256 _state) {
    require(state == _state);
    _;
  }

  modifier onlyPR() {
    require(msg.sender == address(projectRegistry));
    _;
  }

  modifier onlyTR() {
    require(msg.sender == address(tokenRegistry));
    _;
  }

  modifier onlyRR() {
    require(msg.sender == address(reputationRegistry));
    _;
  }

  function Project(uint256 _cost, uint256 _costProportion, address _rr, address _tr, address _dt) public {       //called by THR
    //all checks done in THR first
    tokenRegistry = TokenRegistry(_tr);     //the token holder registry calls this function
    reputationRegistry = ReputationRegistry(_rr);
    projectRegistry = ProjectRegistry(msg.sender);
    distributeToken = DistributeToken(_dt);
    weiCost = _cost;
    reputationCost = _costProportion * reputationRegistry.totalFreeReputationSupply();
  }

  function timesUp() internal view returns (bool) {
    return (now > nextDeadline);
  }

  function setState(uint256 _state) public onlyPR() {
    state = _state;
  }

  function stakeTokens(address _staker, uint256 _tokens, uint256 _weiVal) public onlyTR() onlyInState(1) returns (uint256) {  //called by THR, increments _staker tokens in Project.sol*/
    stakedTokenBalances[_staker] += _tokens;
    totalTokensStaked += _tokens;
    weiBal += _weiVal;
    // ProjectRegistry.checkOpen();
  }

  function unstakeTokens(address _staker, uint256 _tokens) public onlyTR() onlyInState(1) returns (uint256) {    //called by THR only, decrements _staker tokens in Project.sol
    require(stakedTokenBalances[_staker] - _tokens < stakedTokenBalances[_staker] &&   //check overflow
         stakedTokenBalances[_staker] > _tokens);   //make sure _staker has the tokens staked to unstake
    stakedTokenBalances[_staker] -= _tokens;
    totalTokensStaked -= _tokens;
    distributeToken.transfer((_tokens / totalTokensStaked) * weiCost);
  }

  function stakeReputation(address _staker, uint256 _tokens) public onlyRR() onlyInState(1) {
    // require(reputationCost > totalReputationStaked); I don't think this can be reached, because it would move to Open after
    /*require(stakedReputationBalances[_staker] + _tokens > stakedReputationBalances[_staker]);*/
    require(_tokens > 0);
    stakedReputationBalances[_staker] += _tokens;
    // ProjectRegistry.checkOpen();
  }

  function unstakeReputation(address _staker, uint256 _tokens) public onlyRR() onlyInState(1) {
    require(stakedReputationBalances[_staker] - _tokens < stakedReputationBalances[_staker] &&  //check overflow /
      stakedReputationBalances[_staker] > _tokens); //make sure _staker has the tokens staked to unstake
    stakedReputationBalances[_staker] -= _tokens;
  }

  function validate(address _staker, uint256 _tokens, bool _validationState) public onlyTR() onlyInState(5) {
    //checks for free tokens done in THR
    //increments validation tokens in Project.sol only
    // require(ProjectRegistry.checkVoting());
    if (_tokens > 0) {
      if (_validationState == true) {
        validators[_staker] = Validator(1, _tokens);
        totalValidateAffirmative += _tokens;
      }
      else if (_validationState == false){
        validators[_staker] = Validator(0, _tokens);
        totalValidateNegative += _tokens;
      }
    }
  }
  function refundStaker(address _staker) public returns (uint256 _refund) {  //called by THR or WR, allow return of staked, validated, and
    /*require(msg.sender == address(tokenRegistry) ||  msg.sender == address(reputationRegistry));*/
    require(state == 7|| state == 9);
    uint256 refund;     //tokens
    if (msg.sender == address(tokenRegistry)) {
      if(totalTokensStaked != 0) {
        refund = stakedTokenBalances[_staker];
        stakedTokenBalances[_staker] = 0;
      }
      if(totalValidateNegative != 0 || totalValidateAffirmative != 0) {
        refund += validators[_staker].stake;
        uint256 denom;
        if (state == 9) {
          denom = totalValidateNegative;
        } else {
          denom = totalValidateAffirmative;
        }
        if (validateFlag == false) {
          refund += validateReward * validators[_staker].stake / denom;
        } else {
          tokenRegistry.rewardValidator(_staker, (weiCost * validators[_staker].stake / denom));
        }
        validators[_staker].stake = 0;
      }
    } else if (msg.sender == address(reputationRegistry)) {
      if(totalReputationStaked != 0) {
        refund = stakedReputationBalances[_staker];
        stakedReputationBalances[_staker] = 0;
      }
    }
    return refund;
  }

  function() public payable {

  }
}
