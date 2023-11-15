const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { upgrades, ethers } = require("hardhat");

describe("Metafluence", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  let meto;
  let owner;
  let otherAccount;

  beforeEach(async function () {
    ({ meto, owner, otherAccount } = await loadFixture(deploy));
  });

  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MetafluenceBurnable = await ethers.getContractFactory(
      "MetafluenceBurnable"
    );
    const meto = await upgrades.deployProxy(MetafluenceBurnable, [], {
      initializer: "initialize",
      kind: "transparent",
    });

    return { meto, owner, otherAccount };
  }

  async function upgrade() {
    const MetafluenceCCIP = await ethers.getContractFactory("MetafluenceCCIP");
    const metoccip = await upgrades.upgradeProxy(meto.target, MetafluenceCCIP);
    return metoccip;
  }

  describe("Deployment", function () {
    it("Initial mint amount should be 5000_000_000e18", async function () {
      const { meto, owner } = await loadFixture(deploy);
      expect(await meto.balanceOf(owner)).to.equal(
        5000000000000000000000000000n
      );
    });
    it("Initial total supply should be 5000_000_000e18", async function () {
      const { meto } = await loadFixture(deploy);
      expect(await meto.totalSupply()).to.equal(5000000000000000000000000000n);
    });
  });

  describe("Upgrade", function () {
    let metoccip;
    beforeEach(async function () {
      metoccip = await loadFixture(upgrade);
    });

    it("Can be upgraded", async () => {
      await metoccip.addAdmin(otherAccount);
      expect(await metoccip.admins(otherAccount)).to.be.true;
    });

    it("Owner is not admin initially", async function () {
      expect(await metoccip.admins(owner)).to.be.false;
    });

    it("Owner added to be admin", async function () {
      await metoccip.addAdmin(owner);
      expect(await metoccip.admins(owner)).to.be.true;
    });

    it("Other account is not admin", async function () {
      expect(await metoccip.admins(otherAccount)).to.be.false;
    });

    it("Other account added to be admin", async function () {
      await metoccip.connect(owner).addAdmin(otherAccount);
      expect(await metoccip.admins(otherAccount)).to.be.true;
    });

    it("Other account's adminship removed", async function () {
      await metoccip.connect(owner).addAdmin(otherAccount);
      await metoccip.removeAdmin(otherAccount);
      expect(await metoccip.admins(otherAccount)).to.be.false;
    });
  });

  describe("Owner and Admins", function () {
    let metoccip;
    beforeEach(async function () {
      metoccip = await loadFixture(upgrade);
    });
    it("Owner can add admin", async () => {
      await metoccip.connect(owner).addAdmin(otherAccount);
      expect(await metoccip.admins(otherAccount)).to.be.true;
    });
    it("Owner can remove admin", async () => {
      await metoccip.addAdmin(otherAccount);
      expect(await metoccip.admins(otherAccount)).to.be.true;
      await metoccip.removeAdmin(otherAccount);
      expect(await metoccip.admins(otherAccount)).to.be.false;
    });
  });

  describe("Mint & Burn", function () {
    let metoccip;
    beforeEach(async function () {
      metoccip = await loadFixture(upgrade);
    });
    it("Owner can mint", async function () {
      await metoccip.connect(owner).addAdmin(owner);
      await metoccip
        .connect(owner)
        .mint(otherAccount, 1000000000000000000000000000n);
      expect(await metoccip.balanceOf(otherAccount)).to.equal(
        1000000000000000000000000000n
      );
    });
    it("Other account cannot mint", async function () {
      expect(metoccip.connect(otherAccount).mint(5)).to.be.revertedWith(
        "You aren't owner"
      );
    });

    it("Owner can burn their own assets", async function () {
      await metoccip.connect(owner).burn("1000000000000000000000000000");
      expect(await metoccip.balanceOf(owner)).to.equal(
        4000000000000000000000000000n
      );
    });

    it("Other account can burn its own assets", async function () {
      await metoccip.transfer(otherAccount, "1000000000000000000000000000");
      await metoccip.connect(otherAccount).burn("100000000000000000000000000");
      expect(await metoccip.balanceOf(otherAccount)).to.equal(
        900000000000000000000000000n
      );
    });
  });

  describe("Events", function () {
    let metoccip;
    beforeEach(async function () {
      metoccip = await loadFixture(upgrade);
    });
    it("Should emit an event on mint", async function () {
      expect(metoccip.connect(owner).mint(otherAccount, 1)).to.emit(
        metoccip,
        "Mint"
      );
    });
    it("Should emit an event on burn", async function () {
      expect(meto.connect(owner).burn(1)).to.emit(meto, "Burn");
    });
  });

  describe("Transfers", function () {
    it("Assets can be transfered", async function () {
      const { meto, owner, otherAccount } = await loadFixture(deploy);
      await expect(
        meto.connect(owner).transfer(otherAccount, 1)
      ).to.changeTokenBalance(meto, owner, -1);
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
