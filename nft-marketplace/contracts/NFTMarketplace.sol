// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NFTMarketplace {

    uint256 public tokenCount = 0;

    struct NFTItem {
        uint256 tokenId;
        string image;
        string tokenURI;
        string name;
        string description;
        address creator;
        address owner;
        uint256 price;
        uint256 royaltyPercent;
        uint8 category;
        bool isListed;
    }

    mapping(uint256 => NFTItem) public nftItems;

    // EVENTS
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        uint256 price
    );

    event NFTSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    event NFTListed(
        uint256 indexed tokenId,
        uint256 price
    );

    event NFTDelisted(
        uint256 indexed tokenId
    );

    // MINT NFT
    function mintNFT(
        string memory image,
        string memory tokenURI,
        string memory name,
        string memory description,
        uint256 royaltyPercent,
        uint8 category,
        uint256 price
    ) public returns (uint256) {

        tokenCount++;

        uint256 newTokenId = tokenCount;

        nftItems[newTokenId] = NFTItem({
            tokenId: newTokenId,
            image: image,
            tokenURI: tokenURI,
            name: name,
            description: description,
            creator: msg.sender,
            owner: msg.sender,
            price: price,
            royaltyPercent: royaltyPercent,
            category: category,
            isListed: price > 0
        });

        emit NFTMinted(
            newTokenId,
            msg.sender,
            name,
            price
        );

        return newTokenId;
    }

    // GET ALL NFTS
    function getAllNFTs()
        public
        view
        returns (NFTItem[] memory)
    {
        NFTItem[] memory items = new NFTItem[](tokenCount);

        for (uint256 i = 1; i <= tokenCount; i++) {
            items[i - 1] = nftItems[i];
        }

        return items;
    }

    // GET NFTS BY OWNER
    function getNFTsByOwner(address user)
        public
        view
        returns (NFTItem[] memory)
    {
        uint256 count = 0;

        for (uint256 i = 1; i <= tokenCount; i++) {
            if (nftItems[i].owner == user) {
                count++;
            }
        }

        NFTItem[] memory items = new NFTItem[](count);

        uint256 index = 0;

        for (uint256 i = 1; i <= tokenCount; i++) {
            if (nftItems[i].owner == user) {
                items[index] = nftItems[i];
                index++;
            }
        }

        return items;
    }

    // LIST NFT
    function listNFT(
        uint256 tokenId,
        uint256 price
    ) public {

        require(
            nftItems[tokenId].owner == msg.sender,
            "Not owner"
        );

        nftItems[tokenId].price = price;
        nftItems[tokenId].isListed = true;

        emit NFTListed(tokenId, price);
    }

    // DELIST NFT
    function delistNFT(uint256 tokenId) public {

        require(
            nftItems[tokenId].owner == msg.sender,
            "Not owner"
        );

        nftItems[tokenId].isListed = false;
        nftItems[tokenId].price = 0;

        emit NFTDelisted(tokenId);
    }

    // BUY NFT
    function buyNFT(uint256 tokenId) public payable {

        NFTItem storage item = nftItems[tokenId];

        require(item.isListed, "NFT not listed");

        require(
            msg.value >= item.price,
            "Not enough ETH"
        );

        address seller = item.owner;

        payable(seller).transfer(msg.value);

        item.owner = msg.sender;
        item.isListed = false;
        item.price = 0;

        emit NFTSold(
            tokenId,
            msg.sender,
            msg.value
        );
    }
}