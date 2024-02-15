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
    await expect(saleAgreement.connect(seller).createAgreement(buyer.address, ethers.utils.parseEther("1"), ethers.constants.AddressZero))
      .to.emit(saleAgreement, "AgreementCreated");
  });

  describe("Deposit Payment", function () {
    it("Should allow a buyer to deposit payment", async function () {
      const agreementId = await saleAgreement.connect(seller).createAgreement(buyer.address, ethers.utils.parseEther("1"), ethers.constants.AddressZero);
      await expect(saleAgreement.connect(buyer).depositPayment(agreementId, { value: ethers.utils.parseEther("1") })).to.emit(saleAgreement, "PaymentDeposited");
    });
  });

  describe("Raise Dispute", function () {
    it("Should allow parties to raise a dispute", async function () {
      const agreementId = await saleAgreement.connect(seller).createAgreement(buyer.address, ethers.utils.parseEther("1"), ethers.constants.AddressZero);
      await expect(saleAgreement.connect(buyer).raiseDispute(agreementId)).to.emit(saleAgreement, "DisputeRaised");
    });
  });

  describe("Resolve Dispute", function () {
    it("Should allow the arbitrator to resolve disputes", async function () {
      const agreementId = await saleAgreement.connect(seller).createAgreement(buyer.address, ethers.utils.parseEther("1"), ethers.constants.AddressZero);
      await saleAgreement.connect(buyer).raiseDispute(agreementId);
      await expect(saleAgreement.connect(arbitrator).resolveDispute(agreementId, ethers.utils.parseEther("0.5"), ethers.utils.parseEther("0.5"))).to.emit(saleAgreement, "DisputeResolved");
    });
  });

});
