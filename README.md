<div align="center">

<h1>CertiChain</h1>
<h3>Blockchain-Powered Certificate Verification System</h3>
<p>Issue tamper-proof digital certificates on Ethereum. Verify them anywhere in the world — trustlessly.</p>

<img src="https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Network-Sepolia_Testnet-7B3FE4?style=for-the-badge&logo=ethereum&logoColor=white" />

</div>

---

<img width="1901" height="869" alt="Screenshot 2026-05-01 001644" src="https://github.com/user-attachments/assets/808a05d8-92cd-473f-9b05-b26ade13cc4c" />

---

## 📖 What is CertiChain?

**CertiChain** is a full-stack Web3 application that lets institutions issue tamper-proof digital certificates and allows anyone to verify their authenticity — **without trusting any central authority**.

Here's the core idea:

1. When a certificate is issued, its data is stored in **MongoDB** (off-chain).
2. A **SHA-256 cryptographic hash** (unique fingerprint) is generated from the certificate content.
3. That hash is permanently stored on the **Ethereum Sepolia Testnet** via a Solidity smart contract (on-chain).
4. To verify, anyone re-generates the hash from the certificate fields and checks it against the blockchain.

> If even a single character of the certificate data is altered, the hash will not match — and the certificate is immediately flagged as **invalid**. No database can be corrupted. No admin can quietly change records. **The blockchain is the source of truth.**

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Tailwind CSS v4, Framer Motion | User interface & animations |
| **Backend** | Node.js, Express.js 5 | REST API server |
| **Database** | MongoDB Atlas + Mongoose | Off-chain certificate data storage |
| **Hashing** | SHA-256 (`crypto` module / Web Crypto API) | Generating certificate fingerprints |
| **Blockchain** | Ethereum Sepolia Testnet | Immutable on-chain hash storage |
| **Smart Contract** | Solidity 0.8.19 | On-chain verification logic |
| **Web3 Library** | ethers.js v6 | Frontend ↔ Blockchain bridge |
| **Build Tool** | Vite 8 | Frontend dev server & bundler |
| **Dev Tools** | Hardhat 3, Alchemy, MetaMask | Contract deployment & wallet |

---

## 📸 Screenshots
<div align="center">
    <table>
  <tr>
    <th align="center">Issue Certificate</th>
    <th align="center">Verify Certificate</th>
  </tr>

  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/bf08ed2a-b20e-4a5f-a4be-59dc20d6c64e" width="400" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/728708c2-83a4-430b-8a50-ea5138179544" width="400" />
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/572e2b2b-951e-4e0e-83de-96af199d9f1d" width="400" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/4d5a5805-e5cf-460a-87fc-c408e6258d53" width="400" />
    </td>
  </tr>
</table>
</div>

## 🎥 Demo: Issuing a Certificate

https://github.com/user-attachments/assets/1037cc20-c273-4c25-9b02-912d38b6e81e

---

## 🏗️ Project Structure

```
CertiChain-Web3/
│
├── backend/                          ← Node.js + Express REST API
│   ├── controllers/
│   │   └── certificateController.js  ← Business logic (create, fetch)
│   ├── models/
│   │   └── Certificate.js            ← Mongoose schema
│   ├── routes/
│   │   └── certificateRoutes.js      ← Route definitions
│   ├── utils/
│   │   └── hashUtils.js              ← SHA-256 hashing logic
│   ├── .env                          ← Secret config (never commit!)
│   └── server.js                     ← App entry point
│
├── frontend/                         ← React + Vite application
│   └── src/
│       ├── components/
│       │   ├── CreateCertificate.jsx ← Admin: issue certificates
│       │   └── VerifyCertificate.jsx ← Public: verify certificates
│       ├── utils/
│       │   ├── blockchain.js         ← ethers.js contract interactions
│       │   ├── hashUtils.js          ← Client-side SHA-256 hashing
│       │   └── CertificateVerifier.json  ← Contract ABI
│       ├── App.jsx                   ← Root component & tab routing
│       └── main.jsx                  ← React entry point
│
└── blockchain/                       ← Hardhat 3 + Solidity
    ├── contracts/
    │   └── CertificateVerifier.sol   ← Smart contract
    ├── scripts/
    │   └── deploy.js                 ← Deployment script
    ├── hardhat.config.ts             ← Hardhat + Sepolia config
    └── .env                          ← RPC URL + private key (never commit!)
```

---

## ⚙️ How It Works

### 🎓 Issuing a Certificate (Admin Flow)

```
Admin fills form
    │
    ▼
POST /api/certificates/create
    │
    ├── Backend generates SHA-256 hash:
    │   SHA256("John Doe|Computer Science|2024-01-01|MIT")
    │
    ├── Saves { studentName, courseName, issuedDate, issuedBy, hash } → MongoDB
    │
    └── Returns hash to frontend
            │
            ▼
    storeCertificate(hash) called via ethers.js
            │
            ▼
    MetaMask popup → Admin confirms transaction
            │
            ▼
    Hash permanently stored on Ethereum Sepolia ✅
```

### 🔍 Verifying a Certificate (Anyone)

```
Verifier enters certificate details
    │
    ▼
Browser re-generates SHA-256 hash (same formula)
    │
    ▼
verifyCertificate(hash) called on smart contract (read-only, free)
    │
    ├── Returns true  → ✅ Valid Certificate
    └── Returns false → ❌ Invalid / Tampered
```

### 🔒 Why This Is Tamper-Proof

- Changing `"B.Tech"` → `"M.Tech"` produces a completely different hash.
- The new hash does **not** exist in the contract's mapping.
- The certificate shows as **invalid** — instantly, forever.
- Nobody can delete or edit the original hash. Blockchain is immutable.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MetaMask](https://metamask.io) browser extension
- [Alchemy](https://alchemy.com) free account (for Sepolia RPC URL)
- [MongoDB Atlas](https://cloud.mongodb.com) free cluster

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/CertiChain-Web3.git
cd CertiChain-Web3

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install blockchain dependencies
cd ../blockchain && npm install
```

---

### Step 2 — Configure Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/certdb
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

**`blockchain/.env`**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_metamask_wallet_private_key
```

> ⚠️ **Never commit `.env` files to GitHub.** Both directories have `.gitignore` entries for them.

---

### Step 3 — Get Free Sepolia Testnet ETH

1. Open MetaMask → switch network to **Sepolia Testnet**
2. Copy your wallet address
3. Visit [sepoliafaucet.com](https://sepoliafaucet.com) or [faucets.chain.link](https://faucets.chain.link)
4. Paste your address → request free test ETH (takes ~1 min)

---

### Step 4 — Deploy the Smart Contract

```bash
cd blockchain

# Compile the contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the printed contract address → paste it into `backend/.env` as `CONTRACT_ADDRESS`.

Then copy the generated ABI to the frontend:
```bash
cp blockchain/artifacts/contracts/CertificateVerifier.sol/CertificateVerifier.json \
   frontend/src/utils/CertificateVerifier.json
```

Also update `CONTRACT_ADDRESS` inside `frontend/src/utils/blockchain.js`.

---

### Step 5 — Run the Application

Open **three** terminal windows:

```bash
# Terminal 1 — Backend API
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — React Frontend
cd frontend
npm run dev
# → http://localhost:5173

# Terminal 3 — (Optional) Local Hardhat node for development
cd blockchain
npx hardhat node
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 API Reference

### Base URL
```
http://localhost:5000/api/certificates
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/create` | Create a new certificate |
| `GET` | `/:hash` | Fetch a certificate by its SHA-256 hash |

### Example — Create Certificate

```bash
curl -X POST http://localhost:5000/api/certificates/create \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "courseName": "Computer Science",
    "issuedDate": "2024-01-01",
    "issuedBy": "MIT"
  }'
```

**Response:**
```json
{
  "message": "Certificate created successfully",
  "certificate": {
    "_id": "...",
    "studentName": "John Doe",
    "courseName": "Computer Science",
    "issuedDate": "2024-01-01",
    "issuedBy": "MIT",
    "hash": "a3f5c8...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "hash": "a3f5c8..."
}
```

### Example — Get Certificate by Hash

```bash
curl http://localhost:5000/api/certificates/a3f5c8...
```

---

## 📜 Smart Contract Reference

**Contract:** `CertificateVerifier.sol`
**Network:** Ethereum Sepolia Testnet
**Solidity Version:** `^0.8.19`

| Function | Type | Gas | Description |
|---|---|---|---|
| `storeCertificate(string hash)` | Write | Costs gas | Stores a certificate hash on-chain. Restricted to `owner` (deployer). |
| `verifyCertificate(string hash)` | Read (`view`) | Free | Returns `true` if hash exists on-chain, `false` otherwise. |

**Events emitted on store:**
```solidity
event CertificateStored(string hash, address storedBy, uint256 timestamp);
```

---

## 🔮 Future Improvements

- **IPFS Integration** — Store the full certificate PDF on IPFS; save the IPFS CID on-chain instead of just a data hash.
- **Certificate NFTs** — Issue certificates as ERC-721 NFTs that students own directly in their wallets.
- **Role-Based Access** — Allow multiple authorized issuers (not just the single contract owner).
- **QR Code Generation** — Generate scannable QR codes linking directly to the verification page.
- **Revocation Mechanism** — Allow admins to invalidate fraudulent certificates without erasing blockchain history.
- **Admin Dashboard** — Full management UI with search, pagination, and bulk operations.
- **Email Notifications** — Notify students via email when their certificate is issued.
- **Mainnet / L2 Deployment** — Migrate from Sepolia to Ethereum Mainnet or a cheaper L2 like Polygon or Base.

---

## 🌐 Key Concepts Glossary

| Term | Plain English |
|---|---|
| **Blockchain** | A permanent, public ledger that nobody can edit after writing |
| **Smart Contract** | A program stored on the blockchain that runs automatically when called |
| **SHA-256 Hash** | A unique 64-character fingerprint generated from data — changes completely if data changes |
| **MetaMask** | A browser wallet extension that holds your blockchain identity and signs transactions |
| **Gas** | A small ETH fee paid for every write operation on the Ethereum network |
| **Testnet** | A practice version of Ethereum that uses fake ETH — safe for development |
| **Faucet** | A website that drips free testnet ETH to developers |
| **ABI** | Application Binary Interface — the list of functions your smart contract exposes to the outside world |
| **ethers.js** | A JavaScript library for connecting your frontend to Ethereum |
| **Transaction** | Any write operation on the blockchain — permanent, public, and irreversible |
| **Mapping** | A Solidity data structure like a hash map: `string → bool` in this project |
| **`view` function** | A read-only Solidity function — costs no gas to call |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 🔗 Connect With Me

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/parth.builds)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/parthnarkar)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/parthnarkar)
[![LeetCode Profile](https://img.shields.io/badge/LeetCode-ParthNarkar-FFA116?style=for-the-badge&logo=leetcode)](https://leetcode.com/u/parthnarkar/)
[![Email](https://img.shields.io/badge/-Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:parthnarkarofficial@gmail.com)
[![Twitter](https://img.shields.io/badge/-Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/parthnarkar)
[![Discord](https://img.shields.io/badge/-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/parth_narkar)

### ⭐ Found this helpful? Give this Repo a STAR!

[![parth-builds Github Repo Footer](https://github.com/user-attachments/assets/4bef3a04-16ee-4484-a52c-4f31182e1916)](https://github.com/parthnarkar)
