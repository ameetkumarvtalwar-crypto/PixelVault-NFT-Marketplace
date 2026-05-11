# PixelVault — NFT Marketplace
### Engineering Student Project | ERC-721 · Hardhat · ethers.js · IPFS

---

## 📁 Project Structure

```
nft-marketplace/
├── contracts/
│   └── NFTMarketplace.sol     ← Smart contract (ERC-721 + royalties + provenance)
├── scripts/
│   └── deploy.js              ← Hardhat deployment script
├── test/
│   └── NFTMarketplace.test.js ← Unit tests
├── frontend/
│   └── index.html             ← Complete single-file React-free UI
├── hardhat.config.js
├── package.json
└── .env                       ← Create this yourself (see below)
```

---

## ⚙️ Step 1 — Install Dependencies

```bash
# Make sure Node.js ≥ 18 is installed
node --version

cd nft-marketplace
npm install
```

---

## 🔨 Step 2 — Compile the Smart Contract

```bash
npx hardhat compile
```

You'll see `Compiled 1 Solidity file successfully`.  
The ABI + bytecode appear in `frontend/src/artifacts/`.

---

## 🧪 Step 3 — Run Tests

```bash
npx hardhat test
```

All 3 tests should pass:
- ✅ Minting an NFT
- ✅ Listing, buying, and royalty split
- ✅ Provenance history tracking

---

## 🚀 Step 4 — Deploy

### Option A: Local Hardhat Network (easiest for demo)

**Terminal 1** — start the local node:
```bash
npx hardhat node
```
This prints 20 test accounts with 10,000 ETH each. Copy the first private key.

**Terminal 2** — deploy:
```bash
npx hardhat run scripts/deploy.js --network hardhat
```
You'll see:
```
✅  NFTMarketplace deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Option B: Sepolia Testnet (more realistic)

1. Create `.env` in the project root:
```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_metamask_private_key_here
```

2. Get free Sepolia ETH from https://sepoliafaucet.com

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🌐 Step 5 — Update Frontend Config

Open `frontend/index.html` and find this line near the top of the `<script>` block:

```js
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

Replace with **your deployed contract address**.

---

## 🦊 Step 6 — Connect MetaMask

### For local Hardhat network:
1. Open MetaMask → Settings → Networks → Add Network
2. Fill in:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency**: ETH
3. Import a test account:
   - In MetaMask → Import Account
   - Paste the **private key** printed by `npx hardhat node`
   - You'll have 10,000 test ETH

### For Sepolia:
- Just switch MetaMask to **Sepolia Test Network**
- Make sure you have some test ETH from the faucet

---

## 🖼 Step 7 — IPFS Upload Guide

NFT images are stored on IPFS, not on the blockchain (would be too expensive).

### Using NFT.Storage (free, recommended for students):
```
1. Go to https://nft.storage
2. Sign up with email or GitHub
3. Upload your image → copy the CID
4. Create a metadata JSON file:
```

```json
{
  "name": "My Cool NFT",
  "description": "A one-of-a-kind digital artwork",
  "image": "ipfs://Qm...yourImageCID...",
  "category": "Art"
}
```

```
5. Upload that JSON file → copy its CID
6. Your Token URI = ipfs://Qm...yourJsonCID...
```

### Using Pinata (alternative):
```
1. Go to https://pinata.cloud → sign up
2. Upload Files → select your image → get CID
3. Repeat for the metadata JSON
4. Token URI = ipfs://Qm...jsonCID
```

### Tip for the demo:
For a quick local demo, you can also use any public HTTP URL (e.g. from Unsplash) as the image URL in the preview field. The token URI still points to IPFS for the on-chain record.

---

## 🚀 Step 8 — Run the Frontend

Just open the HTML file in a browser:
```bash
# Option 1: directly
open frontend/index.html

# Option 2: using a simple server (avoids CORS issues)
npx serve frontend
# then open http://localhost:3000
```

---

## 🎓 Viva Explanation (Simple Terms)

### Q: What is an NFT?
**A:** NFT stands for Non-Fungible Token. "Non-fungible" means unique and non-interchangeable. Unlike regular ETH (where 1 ETH = any other 1 ETH), each NFT has a unique ID, unique owner, and unique metadata. We use the ERC-721 standard – a set of rules that all NFT contracts follow on Ethereum.

---

### Q: What is ERC-721?
**A:** It's a standard interface (like an API contract) defined by the Ethereum community. Any contract implementing ERC-721 has functions like `ownerOf(tokenId)`, `transferFrom(...)`, `tokenURI(tokenId)` etc. We extend OpenZeppelin's ERC-721 implementation so we don't write security-critical code from scratch.

---

### Q: How does the royalty system work?
**A:** We store a `royaltyPercent` number for each NFT when it's minted. In our `buyNFT()` function, when an NFT is resold:
1. We calculate: `royaltyAmount = salePrice × royaltyPercent / 100`
2. We send that ETH directly to the original creator
3. The platform takes 2.5% fee
4. The seller receives the remainder

This all happens atomically in a single transaction — no trust required.

---

### Q: What is provenance tracking?
**A:** Provenance = ownership history. Every time an NFT is minted or sold, we push a record `{from, to, price, timestamp}` into an array stored on-chain. Anyone can call `getOwnershipHistory(tokenId)` to see the complete audit trail. This proves authenticity — you can verify the NFT came from the original creator.

---

### Q: Why use IPFS instead of storing images on the blockchain?
**A:** Storing large files (images, videos) directly on Ethereum would cost thousands of dollars in gas fees. Instead, we store the image on IPFS (a decentralized peer-to-peer storage network) and only store the IPFS hash (CID) on-chain as part of the `tokenURI`. The URI points to a JSON metadata file which in turn points to the image.

---

### Q: What prevents someone from buying their own NFT?
**A:** We have a check in `buyNFT()`:
```solidity
require(ownerOf(tokenId) != msg.sender, "Cannot buy your own NFT");
```
`msg.sender` is the wallet address calling the function — Solidity provides this automatically and it cannot be faked.

---

### Q: What is re-entrancy and how is it handled?
**A:** Re-entrancy is an attack where a malicious contract calls back into our contract before the first call finishes. We protect against it by following the "Checks-Effects-Interactions" pattern: we update all state variables (owner, isListed, price) BEFORE making any `.transfer()` calls. So even if a malicious contract called us back, the state would already show the sale is complete.

---

### Q: What does Hardhat do?
**A:** Hardhat is a development framework for Ethereum. It:
- Compiles Solidity code
- Runs a local Ethereum blockchain for testing
- Runs automated unit tests (using Mocha + Chai)
- Deploys contracts to any network

---

### Q: What does ethers.js do?
**A:** ethers.js is a JavaScript library that lets a web page talk to the Ethereum blockchain. It:
- Connects to MetaMask (the user's wallet)
- Encodes/decodes function calls (ABI encoding)
- Sends transactions and reads data from smart contracts
- Handles BigInt arithmetic for ETH amounts (since ETH uses 18 decimal places)

---

## 🔐 Security Notes (For Viva)

| Feature | Implementation |
|---|---|
| Access control | `require(ownerOf(tokenId) == msg.sender, ...)` |
| Re-entrancy protection | State updated before ETH transfers |
| Royalty cap | `require(royaltyPercent <= 30, ...)` |
| Overpayment refund | Excess ETH returned to buyer |
| Platform fee | Fixed 2.5% enforced in contract |

---

## 💡 Unique Features Summary

| Feature | Why it's unique |
|---|---|
| **Royalty System** | Creator earns % on every future resale automatically |
| **Category System** | Art / Music / Gaming / Photography / Sports / Other |
| **Provenance Tracking** | Full on-chain ownership history — proves authenticity |
| **Search + Filter** | By name, category, and price sort |
| **Transaction History** | Visible per-NFT in the detail modal |

---

## 📝 .env Template

```
# Create this file in the project root
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=0xabc123...your_private_key
```

⚠️ **Never commit your `.env` file to GitHub!** Add it to `.gitignore`.
