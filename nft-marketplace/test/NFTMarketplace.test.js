// test/NFTMarketplace.test.js
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("NFTMarketplace", function () {
  let marketplace, owner, creator, buyer;

  // Deploy fresh contract before each test
  beforeEach(async () => {
    [owner, creator, buyer] = await ethers.getSigners();
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy();
    await marketplace.waitForDeployment();
  });

  it("should mint an NFT successfully", async () => {
    const tx = await marketplace.connect(creator).mintNFT(
      "ipfs://exampleCID",  // tokenURI
      "Cool Art",           // name
      "A description",      // description
      10,                   // 10% royalty
      0,                    // Category.Art
      ethers.parseEther("0") // not listed
    );
    await tx.wait();

    const item = await marketplace.nftItems(1);
    expect(item.creator).to.equal(creator.address);
    expect(item.name).to.equal("Cool Art");
    expect(item.royaltyPercent).to.equal(10n);
  });

  it("should list and buy an NFT with correct royalty split", async () => {
    // Mint & list at 1 ETH
    await (await marketplace.connect(creator).mintNFT(
      "ipfs://abc", "Art", "Desc", 10, 0, ethers.parseEther("1")
    )).wait();

    const creatorBefore = await ethers.provider.getBalance(creator.address);

    // Buyer purchases
    await (await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.parseEther("1")
    })).wait();

    const item = await marketplace.nftItems(1);
    expect(item.owner).to.equal(buyer.address);
    expect(item.isListed).to.equal(false);

    // Creator balance should have increased by 1 ETH (first sale = no royalty)
    const creatorAfter = await ethers.provider.getBalance(creator.address);
    expect(creatorAfter).to.be.gt(creatorBefore);
  });

  it("should track provenance history", async () => {
    await (await marketplace.connect(creator).mintNFT(
      "ipfs://abc", "Art", "Desc", 10, 0, ethers.parseEther("1")
    )).wait();

    await (await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.parseEther("1")
    })).wait();

    const history = await marketplace.getOwnershipHistory(1);
    expect(history.length).to.equal(2); // mint + sale
    expect(history[0].from).to.equal(ethers.ZeroAddress); // mint has no 'from'
    expect(history[1].from).to.equal(creator.address);
    expect(history[1].to).to.equal(buyer.address);
  });
});
