const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SaleAgreement", function () {
  let saleAgreement;
  let owner, arbitrator, buyer, seller;

  beforeEach(async function () {
    [owner, arbitrator, buyer, seller] = await ethers.getSigners();
    const SaleAgreement = await ethers.getContractFactory("SaleAgreement");
    saleAgreement = await SaleAgreement.deploy(arbitrator.address, owner.address);
  });

  it("Should allow a seller to create an agreement", async function () {
    await expect(saleAgreement.connect(seller).createAgreement(buyer.address, ethers.parseEther("1"), ethers.ZeroAddress))
      .to.emit(saleAgreement, "AgreementCreated");
  });

  describe("Deposit Payment", function () {
    it("Should allow a buyer to deposit payment", async function () {
      // Manually setting agreementId assuming it starts from 0 and increments
      const agreementId = 0; 
      await saleAgreement.connect(seller).createAgreement(buyer.address, ethers.parseEther("1"), ethers.ZeroAddress);
      await expect(saleAgreement.connect(buyer).depositPayment(agreementId, { value: ethers.parseEther("1") }))
        .to.emit(saleAgreement, "PaymentDeposited");
    });
  });

  describe("Raise Dispute", function () {
    it("Should allow parties to raise a dispute", async function () {
      const agreementId = 0; 
      await saleAgreement.connect(seller).createAgreement(buyer.address, ethers.parseEther("1"), ethers.ZeroAddress);
      await expect(saleAgreement.connect(buyer).raiseDispute(agreementId))
        .to.emit(saleAgreement, "DisputeRaised");
    });
  });

  describe("Resolve Dispute", function () {
    it("Should allow the arbitrator to resolve disputes", async function () {
      // Create an agreement
      const txCreate = await saleAgreement.connect(seller).createAgreement(buyer.address, ethers.parseEther("1"), ethers.ZeroAddress);
      await txCreate.wait();
  
      // Assuming agreementId starts from 0 for the first created agreement
      const agreementId = 0;
  
      // Deposit payment to the contract by the buyer (necessary for ETH transactions)
      // Assuming the agreement requires a deposit, it's necessary to simulate it.
      const txDeposit = await saleAgreement.connect(buyer).depositPayment(agreementId, { value: ethers.parseEther("1") });
      await txDeposit.wait();
  
      // Raise a dispute for the agreement
      const txDispute = await saleAgreement.connect(buyer).raiseDispute(agreementId);
      await txDispute.wait();
  
      // Resolve the dispute by the arbitrator
      await expect(saleAgreement.connect(arbitrator).resolveDispute(agreementId, ethers.parseEther("0.5"), ethers.parseEther("0.5")))
        .to.emit(saleAgreement, "DisputeResolved")
        .withArgs(agreementId, ethers.parseEther("0.5"), ethers.parseEther("0.5"));
  
    });
  });

  describe("Change Arbitrator", function () {
    it("Should allow the owner to change the arbitrator's address", async function () {
      // Assuming `newArbitrator` is another account obtained from ethers.getSigners()
      const [owner, arbitrator, newArbitrator] = await ethers.getSigners();
  
      // Changes the arbitrator to a new address
      await expect(saleAgreement.connect(owner).changeArbitrator(newArbitrator.address))
        .to.not.be.reverted;
  
      // Verify that the arbitrator was successfully changed
      expect(await saleAgreement.arbitrator()).to.equal(newArbitrator.address);
    });  
 
  });
  
});
