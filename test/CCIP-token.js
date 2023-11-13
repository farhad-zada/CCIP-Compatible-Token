const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { upgrades, ethers } = require("hardhat");

describe("CCIP-Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  let cciptoken;
  let owner;
  let otherAccount;

  beforeEach(async function () {
    ({ cciptoken, owner, otherAccount } = await loadFixture(deploy));
  });

  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CCIPToken = await ethers.getContractFactory("CCIPToken");
    const cciptoken = await upgrades.deployProxy(CCIPToken, [], {
      initializer: "initialize",
      kind: "transparent",
    });

    return { cciptoken, owner, otherAccount };
  }

  async function upgrade() {
    const CCIPTokenAdmin = await ethers.getContractFactory("CCIPTokenAdmin");
    const upgradedCciptoken = await upgrades.upgradeProxy(
      cciptoken.target,
      CCIPTokenAdmin
    );
    return upgradedCciptoken;
  }

  describe("Deployment", function () {
    it("Initial mint amount should be 5000_000_000e18", async function () {
      const { cciptoken, owner } = await loadFixture(deploy);
      expect(await cciptoken.balanceOf(owner)).to.equal(
        5000000000000000000000000000n
      );
    });
    it("Initial total supply should be 5000_000_000e18", async function () {
      const { cciptoken } = await loadFixture(deploy);
      expect(await cciptoken.totalSupply()).to.equal(
        5000000000000000000000000000n
      );
    });
  });

  describe("Upgrade", function () {
    let upgradedCciptoken;
    beforeEach(async function () {
      upgradedCciptoken = await loadFixture(upgrade);
    });

    it("Can be upgraded", async () => {
      await upgradedCciptoken.addAdmin(otherAccount);
      expect(await upgradedCciptoken.admins(otherAccount)).to.be.true;
    });

    it("Owner is not admin initially", async function () {
      expect(await upgradedCciptoken.admins(owner)).to.be.false;
    });

    it("Owner added to be admin", async function () {
      await upgradedCciptoken.addAdmin(owner);
      expect(await upgradedCciptoken.admins(owner)).to.be.true;
    });

    it("Other account is not admin", async function () {
      expect(await upgradedCciptoken.admins(otherAccount)).to.be.false;
    });

    it("Other account added to be admin", async function () {
      await upgradedCciptoken.connect(owner).addAdmin(otherAccount);
      expect(await upgradedCciptoken.admins(otherAccount)).to.be.true;
    });

    it("Other account's adminship removed", async function () {
      await upgradedCciptoken.connect(owner).addAdmin(otherAccount);
      await upgradedCciptoken.removeAdmin(otherAccount);
      expect(await upgradedCciptoken.admins(otherAccount)).to.be.false;
    });
  });

  describe("Owner and Admins", function () {
    it("", async () => {});
  });

  describe("Mint and Burn", function () {
    it("Owner can mint", async function () {
      const { cciptoken, otherAccount, owner } = await loadFixture(deploy);
      await cciptoken
        .connect(owner)
        .mint(otherAccount, 1000000000000000000000000000n);
      expect(await cciptoken.balanceOf(otherAccount)).to.equal(
        1000000000000000000000000000n
      );
    });
    it("Other account cannot mint", async function () {
      const { cciptoken, otherAccount } = await loadFixture(deploy);
      expect(cciptoken.connect(otherAccount).mint(5)).to.be.revertedWith(
        "You aren't owner"
      );
    });

    it("Owner can burn their own assets", async function () {
      const { cciptoken, owner, otherAccount } = await loadFixture(deploy);
      await cciptoken.connect(owner).burn("1000000000000000000000000000");
      expect(await cciptoken.balanceOf(owner)).to.equal(
        4000000000000000000000000000n
      );
    });

    it("Other account can burn its own assets", async function () {
      const { cciptoken, otherAccount, owner } = await loadFixture(deploy);
      await cciptoken.transfer(otherAccount, "1000000000000000000000000000");
      await cciptoken.connect(otherAccount).burn("100000000000000000000000000");
      expect(await cciptoken.balanceOf(otherAccount)).to.equal(
        900000000000000000000000000n
      );
    });
  });

  describe("Events", function () {
    it("Should emit an event on mint", async function () {
      const { cciptoken, owner, otherAccount } = await loadFixture(deploy);
      expect(cciptoken.connect(owner).mint(otherAccount, 1)).to.emit(
        cciptoken,
        "Mint"
      );
    });
    it("Should emit an event on burn", async function () {
      const { cciptoken, owner, otherAccount } = await loadFixture(deploy);
      expect(cciptoken.connect(owner).burn(1)).to.emit(cciptoken, "Burn");
    });
  });

  describe("Transfers", function () {
    it("Assets can be transfered", async function () {
      const { cciptoken, owner, otherAccount } = await loadFixture(deploy);
      await expect(
        cciptoken.connect(owner).transfer(otherAccount, 1)
      ).to.changeTokenBalance(cciptoken, owner, -1);
    });
  });

  // it("Should fail if the unlockTime is not in the future", async function () {
  //   // We don't use the fixture here because we want a different deployment
  //   const latestTime = await time.latest();
  //   const Lock = await ethers.getContractFactory("Lock");
  //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //     "Unlock time should be in the future"
  //   );
  // });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });
});
