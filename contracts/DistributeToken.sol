pragma solidity ^0.4.21;

import "./library/EIP20.sol";
import "./library/SafeMath.sol";
import "./library/Division.sol";
import "./library/Ownable.sol";

/**
@title Bonded Curve Implementation of an ERC20 token
@author Team: Jessica Marshall, Ashoka Finley
@notice This contract implements functionality to be controlled by a TokenRegistry & a ReputationRegistry.
@dev This contract must be initialized with both a TokenRegistry & a ReputationRegistry.
*/
contract DistributeToken is EIP20(0, "Distributed Utility Token", 18, "DST"), Ownable() {

    using SafeMath for uint256;

    // =====================================================================
    // EVENTS
    // =====================================================================

    event LogMint(uint256 amountMinted, uint256 totalCost, address minter);
    event LogWithdraw(uint256 amountWithdrawn, uint256 reward, address seller);

    // =====================================================================
    // STATE VARIABLES
    // =====================================================================

    address tokenRegistryAddress;
    address reputationRegistryAddress;

    uint256 public weiBal;

    // .00005 ether
    uint256 public baseCost = 50000000000000;

    bool public freeze;

    // =====================================================================
    // MODIFIERS
    // =====================================================================


    modifier onlyTR() {
        require(msg.sender == tokenRegistryAddress);
        _;
    }

    modifier onlyTRorRR() {
        require(
            msg.sender == tokenRegistryAddress ||
            msg.sender == reputationRegistryAddress
        );
        _;
    }

    // =====================================================================
    // CONSTRUCTOR
    // =====================================================================

    /**
    @dev Initialize the DistributeToken contract with the address of a TokenRegistry contract & a
    ReputationRegistry contract
    @param _tokenRegistry Address of the Token Registry
    @param _reputationRegistry Address of the ReputationRegistry
    */
    constructor (address _tokenRegistry, address _reputationRegistry) public {
        require(tokenRegistryAddress == 0 && reputationRegistryAddress == 0);
        tokenRegistryAddress = _tokenRegistry;
        reputationRegistryAddress = _reputationRegistry;
    }

    // =====================================================================
    // OWNABLE
    // =====================================================================

    /**
     * @dev Freezes the distribute token contract and allows existing token holders to withdraw tokens
     */
    function freezeContract() external onlyOwner {
      freeze = true;
    }

    function unfreezeContract() external onlyOwner {
      freeze = false;
    }

    function updateTokenRegistry(address _newTokenRegistry) external onlyOwner {
      tokenRegistryAddress = _newTokenRegistry;
    }

    function updateReputationRegistry(address _newReputationRegistry) external onlyOwner {
      reputationRegistryAddress = _newReputationRegistry;
    }

    // =====================================================================
    // UTILITY
    // =====================================================================

    /**
    @notice Returns the current price of a token calculated as the contract wei balance divided
    by the token supply
    @return The current price of 1 token in wei
    */
    function currentPrice() public view returns (uint256) {
        //calculated current burn reward of 1 token at current weiBal and token supply
        if (weiBal == 0 || totalSupply == 0) { return baseCost; }
        // If totalTokenSupply is greater than weiBal this will fail
        uint256 price = weiBal.div(totalSupply);     // added SafeMath
        return price < baseCost
            ? baseCost
            : price;
    }

    /**
    @notice Return the wei required to mint `_tokens` tokens
    @dev Calulates the target price and multiplies it by the number of tokens desired
    @param _tokens The number of tokens requested to be minted
    @return The wei required to purchase the given amount of tokens
    */
    function weiRequired(uint256 _tokens) public view returns (uint256) {
        require(_tokens > 0);

        return targetPrice(_tokens) *  _tokens;
    }

    /**
    @notice Calulates the price of `_tokens` tokens dependent on the market share that `_tokens`
    tokens represent.
    @dev A helper function to provide clarity for weiRequired
    @param _tokens The number of tokens requested to be minted
    @return The target price of the amount of tokens requested
    */
    function targetPrice(uint _tokens) internal view returns (uint256) {
        uint256 cp = currentPrice();
        uint256 newSupply = totalSupply + _tokens;
        return cp * (1000 + Division.percent(_tokens, newSupply, 3)) / 1000;    // does this need SafeMath?
    }

    // =====================================================================
    // TOKEN
    // =====================================================================

    /**
    @notice Mint `_tokens` tokens, add `_tokens` to the contract totalSupply and add the weiRequired to
    the contract weiBalance
    @dev The required amount of wei must be transferred as the msg.value
    @param _tokens The number of tokens requested to be minted
    */
    function mint(uint _tokens) external payable {
        require(!freeze);
        uint256 weiRequiredVal = weiRequired(_tokens);
        require(msg.value >= weiRequiredVal);

        totalSupply += _tokens;
        balances[msg.sender] += _tokens;
        weiBal += weiRequiredVal;
        emit LogMint(_tokens, weiRequiredVal, msg.sender);
        uint256 fundsLeft = msg.value - weiRequiredVal;
        if (fundsLeft > 0) { msg.sender.transfer(fundsLeft); }
    }

    /**
    @notice Burn `_tokens` tokens by removing them from the total supply, and from the Token Registry
    balance.
    @dev Only to be called by the Token Registry initialized during construction
    @param _tokens The number of tokens to burn
    */
    function burn(uint256 _tokens) external onlyTR {
        require(!freeze);
        require(_tokens <= totalSupply && _tokens > 0);
        balances[msg.sender] -= _tokens;
        totalSupply -= _tokens;
    }

    /**
    @notice Sell `_tokens` tokens at the current token price.
    @dev Checks that `_tokens` is greater than 0 and that `msg.sender` has sufficient balance. The
    corresponding amount of wei is transferred to the `msg.sender`
    @param _tokens The number of tokens to sell.
    */
    function sell(uint256 _tokens) external {
        require(_tokens > 0 && (_tokens <= balances[msg.sender]));

        uint256 weiVal = _tokens * currentPrice();
        balances[msg.sender] -= _tokens;
        totalSupply = totalSupply.sub(_tokens);
        weiBal -= weiVal;
        emit LogWithdraw(_tokens, weiVal, msg.sender);
        msg.sender.transfer(weiVal);
    }

    // =====================================================================
    // TRANSFER
    // =====================================================================

    /**
    @notice Transfer `_weiValue` wei to `_address`       // check where this is used and add that here
    @dev Only callable by the TokenRegistry or ReputationRegistry initialized during contract
    construction
    @param _address Recipient of wei value
    @param _weiValue The amount of wei to transfer to the _address
    */
    function transferWeiTo(address _address, uint256 _weiValue) external onlyTRorRR {
        require(!freeze);
        require(_weiValue <= weiBal);
        weiBal -= _weiValue;
        _address.transfer(_weiValue);
    }

    /**
    @notice Transfer `_tokens` wei to `_address`       // check where this is used and add that here
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _address Recipient of tokens
    @param _tokens The amount of tokens to transfer to the _address
    */

    function transferTokensTo(address _address, uint256 _tokens) external onlyTR {
        // check for overflow
        totalSupply += _tokens;
        balances[_address] += _tokens;
    }

    /**
    @notice Return `_weiValue` wei back to Distribute Token contract
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _weiValue The amount of wei to transfer back to the token contract
    */
    function returnWei(uint _weiValue) external onlyTR {
        require(!freeze);
        // check for overflow
        weiBal += _weiValue;
    }

    /**
    @notice Transfer `_tokens` tokens from the balance of `_owner` to the TokenRegistry escrow
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _owner Owner of the tokens being transferred
    @param _tokens The number of tokens to transfer
    */
    function transferToEscrow(address _owner, uint256 _tokens) external onlyTR returns (bool) {
        require(!freeze);
        require(balances[_owner] >= _tokens);
        balances[_owner] -= _tokens;
        balances[msg.sender] += _tokens;
        return true;
    }

    /**
    @notice Transfer `_tokens` tokens from the TokenRegistry escrow to the balance of `_`
    @dev Only callable by the TokenRegistry initialized during contract construction
    @param _  address of where the tokens being transferred
    @param _tokens The number of tokens to transfer
    */
    function transferFromEscrow(address _receipient, uint256 _tokens) external onlyTR returns (bool) {
        require(!freeze);
        require(balances[msg.sender] >= _tokens);
        balances[msg.sender] -= _tokens;
        balances[_receipient] += _tokens;
        return true;
    }

    // =====================================================================
    // FALLBACK
    // =====================================================================

    function() public payable {}

}
