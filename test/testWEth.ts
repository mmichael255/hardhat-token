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
  describe("depositAndWithdraw", async () => {
    it("singleDeposit", async () => {
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
      //   console.log(`signer:${balanceOfSigner1}`);
      //   console.log(`contract:${balanceOfContract}`);
      assert.equal(ethers.parseEther("10").toString(), balanceOfSigner1);
      assert.equal(balanceOfSigner1, balanceOfContract);
    });
    it("multipleDeposit", async () => {
      const wEth = await getContract();
      const signers = await ethers.getSigners();
      let totalBalance: number = 0;
      for (let i: number = 1; i < 6; i++) {
        const wEthToDeposit = wEth.connect(signers[i]);
        await wEthToDeposit.deposit({ value: ethers.parseEther(i.toString()) });
        totalBalance += i;
      }

      const contractBalance = await ethers.provider.getBalance(wEth);
      const signer4Blance = await wEth.balanceOf(signers[4]);
      const totalSupply = await wEth.totalSupply();

      assert.equal(ethers.parseEther(totalBalance.toString()), contractBalance);
      assert.equal(ethers.parseEther("4").toString(), signer4Blance);
      assert.equal(contractBalance, totalSupply);
    });
    it("multipleDeposiAndWithdraw", async () => {
      const wEth = await getContract();
      const signers = await ethers.getSigners();
      let totalBalance: number = 0;
      const signer4BalanceBeforeDeposited = await ethers.provider.getBalance(
        signers[4]
      );
      for (let i: number = 1; i < 6; i++) {
        const wEthToDeposit = wEth.connect(signers[i]);
        await wEthToDeposit.deposit({ value: ethers.parseEther(i.toString()) });
        totalBalance += Number(ethers.parseEther(i.toString()));
      }
      const signer4BalanceAfterDeposited = await ethers.provider.getBalance(
        signers[4]
      );

      // console.log(
      //   `signer4BalanceBeforeDeposited:${signer4BalanceBeforeDeposited}`
      // );
      // console.log(
      //   `signer4BalanceAfterDeposited:${signer4BalanceAfterDeposited}`
      // );

      const depositGas =
        signer4BalanceBeforeDeposited -
        signer4BalanceAfterDeposited -
        ethers.parseEther("4");
      const signer4Contract = wEth.connect(signers[4]);
      const transactionResponse = await signer4Contract.withdraw(
        ethers.parseEther("3")
      );
      const transactionReceipt = await transactionResponse.wait(1);

      // console.log(transactionReceipt.toJSON());
      // console.log(transactionReceipt.cumulativeGasUsed);

      const withdrawGas =
        BigInt(transactionReceipt.cumulativeGasUsed) *
        BigInt(transactionReceipt.gasPrice);
      // console.log(gas);
      const signer4BalanceAfterWithdrawed = await ethers.provider.getBalance(
        signers[4]
      );
      totalBalance -= Number(ethers.parseEther("3"));
      const contractBalance = await ethers.provider.getBalance(wEth);
      const supply = await wEth.totalSupply();
      assert.equal(contractBalance, BigInt(totalBalance));
      assert.equal(totalBalance, supply);
      assert.equal(
        signer4BalanceBeforeDeposited,
        signer4BalanceAfterDeposited + ethers.parseEther("4") + depositGas
      );
      assert.equal(
        signer4BalanceAfterDeposited,
        signer4BalanceAfterWithdrawed - ethers.parseEther("3") + withdrawGas
      );
    });
  });
  describe("approval", async () => {
    it("tomApproveBob", async () => {
      const wEth = await getContract();
      const signers = await ethers.getSigners();
      const tom = signers[1];
      const bob = signers[2];
      const tomContract = wEth.connect(tom);
      const bobContract = wEth.connect(bob);
      await tomContract.deposit({ value: ethers.parseEther("10") });
      await tomContract.approve(bob, ethers.parseEther("2"));
      const allowanceBeforeBobRetrieve = await wEth.allowance(tom, bob);
      assert.equal(allowanceBeforeBobRetrieve, ethers.parseEther("2"));
      await bobContract.retrieveToken(tom, ethers.parseEther("1"));
      const tomBlanceAfterBobRetrieve = await wEth.balanceOf(tom);
      assert.equal(tomBlanceAfterBobRetrieve, ethers.parseEther("9"));
      const allowanceAfterBobRetrieve = await wEth.allowance(tom, bob);
      assert.equal(allowanceAfterBobRetrieve, ethers.parseEther("1"));
      const bobBlanceAfterRetrieve = await wEth.balanceOf(bob);
      assert.equal(bobBlanceAfterRetrieve, ethers.parseEther("1"));
    });
  });
});
