// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SaleAgreement is ReentrancyGuard, Ownable {
    // Struct to hold agreement details
    struct Agreement {
        address seller;
        address buyer;
        uint256 price;
        address tokenAddress; // Address of the ERC-20 token (address(0) for ETH)
        bool isDisputed;
        bool isResolved;
    }

    address public arbitrator;
    mapping(uint256 => Agreement) public agreements;
    uint256 public nextAgreementId;

    // Events
    event AgreementCreated(uint256 indexed agreementId, address indexed seller, address indexed buyer, uint256 price, address tokenAddress);
    event PaymentDeposited(uint256 indexed agreementId, address indexed payer, uint256 amount);
    event DisputeRaised(uint256 indexed agreementId);
    event DisputeResolved(uint256 indexed agreementId, uint256 sellerAmount, uint256 buyerAmount);

    // Modifier to check if caller is the arbitrator
    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Caller is not the arbitrator");
        _;
    }

    constructor(address _arbitrator, address _owner) Ownable(_owner) {
        require(_arbitrator != address(0), "Invalid arbitrator address");
        arbitrator = _arbitrator;
    }

    // Function to create a new agreement
    function createAgreement(address _buyer, uint256 _price, address _tokenAddress) external returns (uint256) {
        agreements[nextAgreementId] = Agreement({
            seller: msg.sender,
            buyer: _buyer,
            price: _price,
            tokenAddress: _tokenAddress,
            isDisputed: false,
            isResolved: false
        });
        emit AgreementCreated(nextAgreementId, msg.sender, _buyer, _price, _tokenAddress);
        return nextAgreementId++;
    }

    // Function for buyer to deposit payment
    function depositPayment(uint256 _agreementId) external payable nonReentrant {
        Agreement storage agreement = agreements[_agreementId];
        require(msg.sender == agreement.buyer, "Caller is not the buyer");
        require(!agreement.isDisputed, "Agreement is disputed");
        require(!agreement.isResolved, "Agreement is already resolved");

        if(agreement.tokenAddress == address(0)) { // ETH transaction
            require(msg.value == agreement.price, "Incorrect ETH amount");
        } else { // ERC-20 transaction
            IERC20 token = IERC20(agreement.tokenAddress);
            require(token.transferFrom(msg.sender, address(this), agreement.price), "Token transfer failed");
        }
        emit PaymentDeposited(_agreementId, msg.sender, agreement.price);
    }

    // Function to raise a dispute
    function raiseDispute(uint256 _agreementId) external {
        Agreement storage agreement = agreements[_agreementId];
        require(msg.sender == agreement.buyer || msg.sender == agreement.seller, "Caller is not part of the agreement");
        require(!agreement.isResolved, "Agreement is already resolved");
        agreement.isDisputed = true;
        emit DisputeRaised(_agreementId);
    }

    // Function for arbitrator to resolve dispute
    function resolveDispute(uint256 _agreementId, uint256 _sellerAmount, uint256 _buyerAmount) external onlyArbitrator {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isDisputed, "Agreement is not disputed");
        require(_sellerAmount + _buyerAmount == agreement.price, "Incorrect allocation");

        if(agreement.tokenAddress == address(0)) { // ETH transaction
            payable(agreement.seller).transfer(_sellerAmount);
            payable(agreement.buyer).transfer(_buyerAmount);
        } else { // ERC-20 transaction
            IERC20 token = IERC20(agreement.tokenAddress);
            if(_sellerAmount > 0) token.transfer(agreement.seller, _sellerAmount);
            if(_buyerAmount > 0) token.transfer(agreement.buyer, _buyerAmount);
        }
        agreement.isResolved = true;
        emit DisputeResolved(_agreementId, _sellerAmount, _buyerAmount);
    }

    // Function to change the arbitrator
    function changeArbitrator(address _newArbitrator) external onlyOwner {
        require(_newArbitrator != address(0), "Invalid arbitrator address");
        arbitrator = _newArbitrator;
    }
}
