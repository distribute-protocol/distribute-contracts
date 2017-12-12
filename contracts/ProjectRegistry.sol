pragma solidity ^0.4.8;

import "./Project.sol";

contract ProjectRegistry {
  TokenRegistry tokenRegistry;
  ReputationRegistry reputationRegistry;

  uint256 public projectNonce = 0;                          //no projects in existence when contract initialized
  mapping(uint256 => Projects) public projectId;                    //projectId to project address

  struct Projects {
    address projectAddress;
    uint256 votingPollId;             //for voting
  }

  struct Proposer {
    address proposer;         //who is the proposer
    uint256 proposerStake;    //how much did they stake in tokens
    uint256 projectCost;      //cost of the project in ETH/tokens?
  }

  mapping(address => Proposer) proposers;                   //project -> Proposer

  function ProjectRegistry(address _tokenRegistry, address _reputationRegistry) public {       //contract is created
    require(address(tokenRegistry) == 0 && address(reputationRegistry) == 0);
    tokenRegistry = TokenRegistry(_tokenRegistry);
    reputationRegistry = ReputationRegistry(_reputationRegistry);
    //updateMintingPrice(0);
  }
  // =====================================================================
  // MODIFIERS
  // =====================================================================
  modifier onlyTR() {
    require(msg.sender == address(tokenRegistry));
    _;
  }

  modifier onlyRR() {
    require(msg.sender == address(reputationRegistry));
    _;
  }
  /*modifier projectExists(uint256 _projectId) {
    require(_projectId <= projectNonce && _projectId > 0);
    _;
  }

  modifier isProject(uint256 _projectId) {
      require(projectId[_projectId].projectAddress == msg.sender);
      _;
  }*/

  function projectExists(uint256 _projectId) public returns (bool) {
    return _projectId <= projectNonce && _projectId > 0;
  }

  // =====================================================================
  // GENERAL FUNCTIONS
  // =====================================================================

  function getProjectAddress(uint256 _id) public view returns (address) {
    require(_id <= projectNonce && _id > 0);
    return projectId[_id].projectAddress;
  }
  function getProposerAddress(address _projectAddress) public view returns (address) {
    return proposers[_projectAddress].proposer;
  }

  function getPollId(uint256 _id) public view onlyRR() returns (uint256) {
    require(_id <= projectNonce && _id > 0);
    return projectId[_id].votingPollId;
  }

  function setProject(uint256 _projectNonce, address _projectAddress) public onlyTR() returns (bool) {
    Projects project = projectId[_projectNonce];
    project.projectAddress = _projectAddress;
    return true;
  }
  function incrementProjectNonce() public onlyTR() returns (bool) {
    projectNonce += 1;
    return true
  }


  function setProposer(address _projectAddress, address _proposer, uint256 _proposerStake, uint256 _cost) public onlyTR() returns (bool) {
    Proposer proposer = proposers[_projectAddress];
    proposer.proposer = _proposer;
    proposer.proposerStake = _proposerStake;
    proposer.projectCost = _cost;
    return true;
  }
}
