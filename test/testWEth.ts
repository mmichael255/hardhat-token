import { ignition, ethers } from "hardhat";
import WEthMoudule from "../ignition/modules/WEthMoudule";
import { assert, expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { WEthInterface } from "../typechain-types/WEth";

describe("WEth", async () => {
  async function deployWEth() {
    const { WEth } = await ignition.deploy(WEthMoudule);
    return WEth;
  }
  async function getContract() {
    const wEthContract = await loadFixture(deployWEth);
    return wEthContract;
  }

  describe("construtor", async () => {
    it("initializeProperly", async () => {
      const wEth = await getContract();
      const nameOfwEth = await wEth.name();
      const symbolOfwEth = await wEth.symbol();

      assert.equal(nameOfwEth, "WrapEth");
      assert.equal(symbolOfwEth, "WEth");
    });
  });
  describe("deposit", async () => {
    it("singleDepositAndGetWEth", async () => {
      const wEth = await getContract();
      const signers = await ethers.getSigners();
      const wEthToDeposit = wEth.connect(signers[1]);
      const transactionResponse = await wEthToDeposit.deposit({
        value: ethers.parseEther("10"),
      });
      const transactionReceipt = await transactionResponse.wait(1);
      //   console.log(transactionReceipt);
      const balanceOfSigner1 = await wEth.balanceOf(signers[1]);
      const balanceOfContract = await ethers.provider.getBalance(wEth);
      console.log(`signer:${balanceOfSigner1}`);
      console.log(`contract:${balanceOfContract}`);
      assert.equal(ethers.parseEther("10").toString(), balanceOfSigner1);
      assert.equal(balanceOfSigner1, balanceOfContract);
    });
  });
});
