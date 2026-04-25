# CertiChain - Certificate Verification System

### Blockchain-Powered Certificate Authenticity — MERN + Ethereum

[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org)
[![Node](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-purple)](https://sepolia.etherscan.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📖 Description

The **Certificate Verification System** is a hybrid MERN + Web3 application that enables institutions to issue tamper-proof digital certificates and allows anyone in the world to verify their authenticity — without trusting any central server.

When a certificate is created:
1. Its data is stored in MongoDB (off-chain).
2. A cryptographic **SHA-256 hash** (a unique fingerprint) is generated from its content.
3. That hash is stored permanently on the **Ethereum Sepolia testnet** (on-chain) via a Solidity smart contract.

To verify a certificate, anyone can enter the certificate details, re-generate the hash, and check it against the blockchain. If the data was ever altered — even by a single character — the hash will not match, and the certificate will show as **invalid**.

No database can be corrupted. No administrator can change records. The blockchain is the source of truth.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Tailwind CSS | User interface |
| Backend | Node.js, Express.js | REST API server |
| Database | MongoDB Atlas | Certificate data storage |
| Hashing | SHA-256 (Node crypto) | Generating certificate fingerprints |
| Blockchain | Ethereum (Sepolia Testnet) | Immutable hash storage |
| Smart Contract | Solidity 0.8.19 | On-chain verification logic |
| Web3 Library | ethers.js v6 | Frontend ↔ Blockchain bridge |
| Dev Tools | Hardhat, Alchemy, MetaMask | Contract deployment and wallet |

---

## 🏗 Architecture

```
certificate-verification/
├── backend/                    ← Node.js + Express REST API
│   ├── controllers/
│   │   └── certificateController.js
│   ├── models/
│   │   └── Certificate.js      ← MongoDB schema
│   ├── routes/
│   │   └── certificateRoutes.js
│   ├── utils/
│   │   └── hashUtils.js        ← SHA-256 hashing
│   ├── .env                    ← Secret config (never commit)
│   └── server.js
│
├── frontend/                   ← React application
│   └── src/
│       ├── components/
│       │   ├── CreateCertificate.jsx
│       │   └── VerifyCertificate.jsx
│       ├── utils/
│       │   ├── blockchain.js        ← ethers.js functions
│       │   ├── hashUtils.js         ← client-side hashing
│       │   └── CertificateVerifier.json  ← contract ABI
│       └── App.jsx
│
└── blockchain/                 ← Hardhat + Solidity
    ├── contracts/
    │   └── CertificateVerifier.sol
    ├── scripts/
    │   └── deploy.js
    ├── hardhat.config.js
    └── .env
```

### System Architecture Diagram

```
[React Frontend]
     |
     |-- (axios) --> [Express Backend] --> [MongoDB Atlas]
     |                    |
     |                    └── (generates SHA-256 hash) --> returns hash
     |
     |-- (ethers.js + MetaMask) --> [Ethereum Sepolia Testnet]
                                          |
                                    [Smart Contract]
                                    storeCertificate(hash)
                                    verifyCertificate(hash)
```

---

## ⚙️ How the System Works

### Certificate Issuance (Admin)
1. Admin fills in: Student Name, Course Name, Issue Date, Issued By.
2. React sends data to Express backend via POST `/api/certificates/create`.
3. Backend generates a SHA-256 hash: `SHA256("John Doe|CS|2024-01-01|MIT")`.
4. Backend saves the certificate + hash to MongoDB.
5. Backend returns the hash to the frontend.
6. React calls `storeCertificate(hash)` on the deployed Solidity contract via MetaMask.
7. MetaMask prompts the admin to confirm the transaction (uses free Sepolia ETH).
8. The hash is permanently stored on the Ethereum blockchain.

### Certificate Verification (Anyone)
1. Verifier enters the same fields on the verification page.
2. Browser regenerates the SHA-256 hash using the same formula.
3. React calls `verifyCertificate(hash)` on the smart contract (free — no MetaMask needed).
4. Smart contract returns `true` (hash found) or `false` (not found).
5. UI shows ✅ **Valid Certificate** or ❌ **Invalid / Tampered**.

### Why Blockchain Makes This Tamper-Proof
- If a certificate's Grade changes from "B.Tech" to "M.Tech", the hash changes completely.
- The new hash won't exist in the smart contract's mapping.
- The certificate immediately shows as **invalid**.
- No one can delete or edit the original hash — blockchain is immutable.

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [MetaMask](https://metamask.io) browser extension
- [Alchemy](https://alchemy.com) free account (for Sepolia RPC URL)
- [MongoDB Atlas](https://cloud.mongodb.com) free cluster

### Step 1 — Clone and Install

```bash
git clone https://github.com/your-username/certificate-verification.git
cd certificate-verification

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install blockchain dependencies
cd ../blockchain && npm install
```

### Step 2 — Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/certdb
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Create `blockchain/.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_metamask_wallet_private_key
```

> ⚠️ **Never commit .env files to GitHub.** Both are listed in `.gitignore`.

### Step 3 — Get Sepolia Testnet ETH

1. Open MetaMask → Switch network to **Sepolia Testnet**
2. Copy your wallet address
3. Go to [sepoliafaucet.com](https://sepoliafaucet.com) or [faucets.chain.link](https://faucets.chain.link)
4. Paste your address → Request free test ETH

### Step 4 — Deploy the Smart Contract

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the printed contract address and add it to `backend/.env` as `CONTRACT_ADDRESS`.

Then copy the ABI to the frontend:
```bash
cp blockchain/artifacts/contracts/CertificateVerifier.sol/CertificateVerifier.json \
   frontend/src/utils/CertificateVerifier.json
```

Also update `CONTRACT_ADDRESS` in `frontend/src/utils/blockchain.js`.

---

## ▶️ How to Run

Open three separate terminal windows:

```bash
# Terminal 1 — Backend API
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — React Frontend
cd frontend
npm start
# Runs on http://localhost:3000

# Terminal 3 — (Optional) Hardhat local testnet for development
cd blockchain
npx hardhat node
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the API

Use Thunder Client, Postman, or curl:

```bash
# Create a certificate
curl -X POST http://localhost:5000/api/certificates/create \
  -H "Content-Type: application/json" \
  -d '{"studentName":"John Doe","courseName":"Computer Science","issuedDate":"2024-01-01","issuedBy":"MIT"}'

# Get certificate by hash
curl http://localhost:5000/api/certificates/YOUR_HASH_HERE
```

---

## 🗺 Smart Contract Reference

**Contract:** `CertificateVerifier.sol`  
**Network:** Ethereum Sepolia Testnet  
**Verified on:** [sepolia.etherscan.io](https://sepolia.etherscan.io)

| Function | Type | Description |
|---|---|---|
| `storeCertificate(string hash)` | Write (costs gas) | Stores a certificate hash on-chain. Only callable by owner (admin). |
| `verifyCertificate(string hash)` | Read (free) | Returns `true` if hash exists, `false` if not. |

---

## 🔮 Future Improvements

- **IPFS Integration** — Store the full certificate PDF on IPFS (decentralized storage) and save the IPFS hash on-chain, not just the data hash.
- **Role-Based Access Control** — Allow multiple authorized issuers (not just the contract owner).
- **Certificate NFTs** — Issue certificates as ERC-721 NFTs that students own in their wallets.
- **QR Code Generation** — Generate a scannable QR code on each certificate that links to the verification page.
- **Mainnet Deployment** — Migrate from Sepolia testnet to Ethereum Mainnet or a cheaper L2 like Polygon or Base.
- **Email Notifications** — Notify students via email when their certificate is issued.
- **Admin Dashboard** — Full certificate management UI with pagination, search, and revocation.
- **Revocation Mechanism** — Allow admin to invalidate a certificate (e.g., fraudulent degree) without deleting blockchain data.

---

## 🌐 Key Concepts Glossary

| Term | Plain English Explanation |
|---|---|
| Blockchain | A permanent, public database that no one can edit after writing |
| Smart Contract | A program stored on blockchain that runs automatically |
| Hash | A unique fingerprint generated from data — changes if data changes |
| MetaMask | A browser wallet that holds your blockchain identity |
| Gas | A small fee paid in ETH for writing data to blockchain |
| Testnet | A practice version of Ethereum that uses fake money |
| Faucet | A website that gives free testnet ETH for development |
| ABI | A list of functions your smart contract exposes |
| Transaction | Any write operation on the blockchain (permanent record) |
| ethers.js | JavaScript library to connect your app to Ethereum |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

*Built with ❤️ using MERN Stack + Ethereum Blockchain*
