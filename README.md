# Tokenized-Reward-System
A simple decentralized application (DApp) that issues reward tokens (ERC-20) to users and allows token transfer and balance check through a basic web interface.

- Overview: An ERC-20 token featuring an owner-restricted rewardUser mechanism for controlled reward distribution.
- Tech Stack: Solidity with Hardhat and ethers v6 (smart contracts); Next.js frontend with MetaMask integration on Polygon Amoy.
---

## Prerequisites
- Node.js **v20 or higher** (>= 20)
- MetaMask browser extension: https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
- **Etherscan API key** (API v2): https://docs.etherscan.io/getting-an-api-key  
  *Note: Polygon Amoy is supported via the Etherscan-family API v2.*
- Some **Amoy POL** for gas: https://faucet.polygon.technology/
---

## 1) Smart Contract (Hardhat)

**Install**
```bash
cd web3
npm i
```

**Env → web3/.env**
```
AMOY_RPC_URL=https://rpc-amoy.polygon.technology  # Polygon Amoy testnet RPC (use Infura or Alchemy for faster retrieval) 
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
API_KEY=YOUR_POLYGONSCAN_API_KEY
```

**Compile + deploy + verify**
```bash
npx hardhat compile
npx hardhat run scripts/deploy-and-verify.js --network polygonAmoy
```

## 2) Frontend (Next.js)

**Install**
```bash
cd ../frontend
npm i
```

**Env → frontend/.env**
```
NEXT_PUBLIC_TOKEN_ADDRESS=0xYourDeployedTokenAddress
NEXT_PUBLIC_CHAIN_ID=80002
```

**Run**
```bash
npm run dev
```

Open the URL shown (http://localhost:5173), connect MetaMask Wallet, and switch to Polygon(Amoy) testnet network when prompted.

<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/0bc2d689-8045-46d1-91ce-f6de7a768a97" />

## Demo video

https://github.com/user-attachments/assets/c43a574f-9086-4f7c-86cc-b5806f0f3389

## Notes
- Reward is owner-only; the button is disabled if your connected wallet ≠ on-chain owner().
- After a tx, the UI shows:
- Status: open in explorer (pending)
- Status: Transaction confirmed — open in explorer (mined)
