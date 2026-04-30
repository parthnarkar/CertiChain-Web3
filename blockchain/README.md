# 🔗 Blockchain — CertiChain

> **Learning-oriented deep dive** into every concept, file, and tool in the `blockchain/` folder.
> This is your complete guide to understanding the smart contract layer of CertiChain.

---

## 📁 Folder Structure

```
blockchain/
├── contracts/
│   └── CertificateVerifier.sol   ← The Solidity smart contract
├── scripts/
│   └── deploy.js                 ← Deployment script (ethers.js)
├── artifacts/                    ← Auto-generated after `npx hardhat compile`
│   └── contracts/
│       └── CertificateVerifier.sol/
│           └── CertificateVerifier.json  ← ABI + bytecode
├── cache/                        ← Hardhat's internal compilation cache
├── hardhat.config.ts             ← Main Hardhat configuration
├── tsconfig.json                 ← TypeScript compiler settings
├── package.json                  ← Dependencies (Hardhat, ethers, dotenv, TS)
├── .gitignore                    ← Files excluded from git
└── .env                          ← Secret keys (NEVER commit this)
```

---

## 🧠 Core Concepts (Start Here)

### What is a Smart Contract?

A smart contract is a **program that lives on the blockchain**. Unlike traditional server-side code:

| Traditional Code | Smart Contract |
|---|---|
| Runs on a server you control | Runs on every node in the Ethereum network |
| Can be edited or deleted | Immutable after deployment |
| Requires you to trust the server | Trustless — anyone can read the code |
| Free to run | Costs gas (ETH) for write operations |

In CertiChain, the smart contract acts as an **immutable registry** of certificate hashes.

### What is Solidity?

Solidity is a statically-typed, compiled programming language for writing smart contracts. It compiles down to **EVM bytecode** (Ethereum Virtual Machine instructions), similar to how Java compiles to bytecode.

- Version used: `^0.8.19`
- File extension: `.sol`
- Syntax: Similar to JavaScript / C++

### What is Hardhat?

Hardhat is a **development framework** for Ethereum smart contracts. It provides:

- **Compilation** — turns `.sol` files into bytecode + ABI
- **Local blockchain** — `npx hardhat node` spins up a local Ethereum node
- **Deployment scripts** — run JS/TS scripts to deploy contracts
- **Testing** — write unit tests for contracts in JavaScript/TypeScript
- **Plugins** — extend with tools like `hardhat-ethers`

---

## 📄 `contracts/CertificateVerifier.sol` — Line by Line

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
```

- `SPDX-License-Identifier` — Required comment that specifies the open-source license. Omitting it gives a compiler warning.
- `pragma solidity ^0.8.19` — Tells the compiler this code requires Solidity version 0.8.19 or above (but less than 0.9.0). The `^` means "compatible with."

---

```solidity
contract CertificateVerifier {
```

- `contract` is Solidity's equivalent of a `class` in OOP.
- Everything inside `{}` is the contract's state and behavior.
- Once deployed, this becomes an **address** on the blockchain.

---

### State Variables

```solidity
address public owner;
```

- `address` — A special Solidity type (20-byte Ethereum wallet/contract address).
- `public` — Solidity auto-generates a getter function, so anyone can call `owner()` to read it.
- `owner` — Stores the wallet address of whoever deployed the contract (the admin).

```solidity
mapping(string => bool) private certificateHashes;
```

- `mapping` — Solidity's version of a hash map / dictionary.
- `string => bool` — Keys are strings (SHA-256 hashes), values are booleans (`true` = hash stored, `false` / nonexistent = not stored).
- `private` — Only accessible within this contract. No auto-generated getter.
- Mappings in Solidity always return a default value for unknown keys (`false` for booleans), so `certificateHashes["nonexistent"]` safely returns `false`.

---

### Events

```solidity
event CertificateStored(string hash, address storedBy, uint256 timestamp);
```

- `event` — A mechanism to emit logs to the blockchain. Events are stored in **transaction receipts**, not in contract state.
- Events are **cheaper** than storing data in state variables.
- They can be **indexed and filtered** by blockchain explorers and off-chain code using ethers.js.
- `uint256` — A 256-bit unsigned integer. `block.timestamp` is a Unix timestamp in seconds.
- When `storeCertificate()` is called, this event is emitted and becomes a permanent log entry on the blockchain.

---

### Constructor

```solidity
constructor() {
    owner = msg.sender;
}
```

- `constructor()` — Runs **once**, at deployment time.
- `msg.sender` — A global variable in Solidity. Inside any function, it refers to the **wallet address that called this function**.
- At deployment, `msg.sender` = the deploying wallet → becomes the `owner`.
- After deployment, the constructor never runs again.

---

### Modifier

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this");
    _;
}
```

- `modifier` — A reusable "guard" that wraps a function.
- `require(condition, "error message")` — If `condition` is false, the transaction **reverts** (all state changes are undone) and the error message is returned. Gas consumed up to that point is still charged.
- `_;` — A placeholder where the actual function body is inserted. Code before `_;` runs first, code after runs after the function body.
- Usage: `function foo() public onlyOwner { ... }` — `onlyOwner` runs first, then `foo`'s body.

---

### `storeCertificate` Function

```solidity
function storeCertificate(string memory certHash) public onlyOwner {
    require(!certificateHashes[certHash], "Certificate already exists");
    certificateHashes[certHash] = true;
    emit CertificateStored(certHash, msg.sender, block.timestamp);
}
```

- `string memory certHash` — The function takes a string argument. `memory` means it lives in temporary memory during the function call (vs `storage` which persists on-chain).
- `public` — Callable from anywhere (externally by wallets, and internally).
- `onlyOwner` — The modifier is applied. Only the owner's wallet can call this.
- `require(!certificateHashes[certHash], ...)` — Prevents storing the same hash twice. `!` negates the boolean — if hash already exists (is `true`), the call reverts.
- `certificateHashes[certHash] = true` — Writes to the on-chain mapping. This is the **write** that costs gas.
- `emit CertificateStored(...)` — Fires the event, logging the hash, caller's address, and timestamp to the blockchain.

> **Gas cost:** Writing to storage is one of the most expensive EVM operations. Storing a new mapping entry costs ~20,000 gas.

---

### `verifyCertificate` Function

```solidity
function verifyCertificate(string memory certHash) public view returns (bool) {
    return certificateHashes[certHash];
}
```

- `view` — Declares the function as read-only. It cannot modify state. EVM nodes execute it locally without broadcasting a transaction.
- `returns (bool)` — The function's return type declaration.
- `certificateHashes[certHash]` — Reads from the mapping. Returns `true` if the hash was stored, `false` otherwise.
- **No gas cost** — `view` functions called externally (via ethers.js `contract.verifyCertificate(hash)`) are free because no transaction is created.

---

## 📄 `scripts/deploy.js` — How Deployment Works

```js
import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const artifact = await hre.artifacts.readArtifact("CertificateVerifier");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
}
```

**Step by step:**

1. `JsonRpcProvider` — Connects to Sepolia via Alchemy's RPC URL (HTTP endpoint to communicate with Ethereum nodes).
2. `ethers.Wallet` — Creates a wallet instance from your private key. This wallet signs the deployment transaction.
3. `hre.artifacts.readArtifact("CertificateVerifier")` — Reads the compiled output from `artifacts/`. Contains the ABI and bytecode.
4. `ContractFactory` — A helper that packages the bytecode and ABI, ready to deploy.
5. `factory.deploy()` — Creates a transaction that sends the contract's bytecode to Ethereum. No `to` address — this is how Ethereum knows it's a contract creation.
6. `contract.waitForDeployment()` — Waits for the transaction to be mined (included in a block).
7. `contract.getAddress()` — Returns the new contract's on-chain address.

**How to run:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 📄 `hardhat.config.ts` — Configuration Explained

```typescript
import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  solidity: {
    version: "0.8.19",
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  networks: {
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});
```

- `hardhat-ethers` plugin — Injects ethers.js into Hardhat's runtime (`hre.ethers`).
- `dotenv.config()` — Loads `.env` into `process.env` so secrets aren't hardcoded.
- `solidity.version` — The exact Solidity compiler version Hardhat downloads and uses.
- `paths` — Tells Hardhat where to find source files and where to write output.
- `networks.sepolia` — Defines the Sepolia testnet connection. `accounts` is the array of deployer private keys.
- `type: "http"` — Hardhat 3's way of declaring an HTTP JSON-RPC network.

> **Security:** The private key is loaded from `.env` and never hardcoded. The `.gitignore` excludes `.env` from git.

---

## 📄 `package.json` — Dependencies

```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-ethers": "^4.0.9",
    "@types/node": "^22.19.17",
    "dotenv": "^17.4.2",
    "ethers": "^6.16.0",
    "hardhat": "^3.4.2",
    "typescript": "~5.8.0"
  },
  "type": "module"
}
```

| Package | Role |
|---|---|
| `hardhat` | Core development framework |
| `@nomicfoundation/hardhat-ethers` | Plugin that integrates ethers.js with Hardhat |
| `ethers` | JavaScript library for Ethereum interactions |
| `dotenv` | Loads `.env` file into `process.env` |
| `typescript` | TypeScript compiler (config written in `.ts`) |
| `@types/node` | TypeScript type definitions for Node.js built-ins |

> `"type": "module"` — Tells Node.js this package uses ES Modules (`import`/`export`) instead of CommonJS (`require`).

---

## 📄 `tsconfig.json` — TypeScript Settings

```json
{
  "compilerOptions": {
    "lib": ["es2023"],
    "module": "node16",
    "target": "es2022",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node16",
    "outDir": "dist"
  }
}
```

| Setting | Meaning |
|---|---|
| `target: "es2022"` | Compile TypeScript down to ES2022 JavaScript |
| `module: "node16"` | Use Node.js 16+ module resolution rules (supports ESM) |
| `strict: true` | Enables all strict type-checking options |
| `esModuleInterop: true` | Allows `import x from 'y'` for CommonJS modules |
| `skipLibCheck: true` | Skip type-checking `.d.ts` files (faster builds) |
| `outDir: "dist"` | Compiled JS output goes to `/dist` (but `/dist` is gitignored) |

---

## 📄 `.gitignore` — What Gets Excluded

```
/node_modules     ← npm packages (huge, reproducible via npm install)
/dist             ← TypeScript compiled output
/bundle           ← pnpm deploy output
/artifacts        ← Hardhat compiled contracts (regenerated by compile)
/cache            ← Hardhat's internal cache
/types            ← Typechain generated types
.env              ← SECRET KEYS — never commit!
.env.*            ← All variants of .env
!.env.example     ← Exception: .env.example (template with no real values) IS committed
/coverage         ← Test coverage reports
/.gas-snapshot    ← Gas usage snapshots for testing
/snapshots        ← Hardhat snapshot cheatcode output
```

> The most important entry is `.env` — your private key and RPC URL must never be pushed to GitHub.

---

## 🔑 Environment Variables (`.env`)

Create a file called `.env` in the `blockchain/` directory:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=0xabc123...your_metamask_private_key
```

### How to get `SEPOLIA_RPC_URL`
1. Go to [alchemy.com](https://alchemy.com) → Create a free account
2. Create a new app → Select **Ethereum** → Select **Sepolia**
3. Copy the HTTPS endpoint URL

### How to get `PRIVATE_KEY`
1. Open MetaMask → Click the three dots menu → **Account details**
2. Click **Show private key** → Confirm your password
3. Copy the key (starts with `0x`)

> ⚠️ **WARNING:** Your private key = full control over your wallet. Never share it. Never commit it. Use a dedicated dev wallet, not your main wallet.

---

## 🔄 Deployment Workflow (Complete)

```
1. Write contract (.sol)
         │
         ▼
2. npx hardhat compile
   → Generates artifacts/contracts/CertificateVerifier.sol/CertificateVerifier.json
   (contains ABI + bytecode)
         │
         ▼
3. npx hardhat run scripts/deploy.js --network sepolia
   → deploy.js reads the artifact
   → Signs a deployment transaction with your private key
   → Sends bytecode to Sepolia via Alchemy RPC
   → Waits for mining
   → Prints the deployed contract address
         │
         ▼
4. Copy contract address → backend/.env (CONTRACT_ADDRESS)
         │
         ▼
5. Copy ABI JSON → frontend/src/utils/CertificateVerifier.json
         │
         ▼
6. Update CONTRACT_ADDRESS in frontend/src/utils/blockchain.js
         │
         ▼
✅ Contract is live on Sepolia. Frontend + backend can now interact with it.
```

---

## 🌐 How the Frontend Talks to the Contract

The frontend uses **ethers.js** with MetaMask. Here's the pattern:

```js
// 1. Connect to MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. Create a contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// 3a. Write (costs gas, triggers MetaMask popup)
const tx = await contract.storeCertificate(hash);
const receipt = await tx.wait(); // wait for mining

// 3b. Read (free, no MetaMask popup)
const isValid = await contract.verifyCertificate(hash);
```

- `BrowserProvider` — ethers.js v6 way to wrap MetaMask's `window.ethereum`.
- `getSigner()` — Gets the connected wallet (used to sign transactions).
- `Contract` — The ethers.js contract instance. Knows the ABI, so you can call functions by name.
- `tx.wait()` — Waits for the transaction to be included in a mined block. Returns a receipt with `receipt.hash` (the transaction ID).

---

## 🧪 Common Hardhat Commands

```bash
# Compile contracts
npx hardhat compile

# Start a local blockchain (for development)
npx hardhat node

# Deploy to local node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Run tests (if you add test files)
npx hardhat test

# See all available tasks
npx hardhat help
```

---

## 💡 Key Solidity Concepts Summary

| Concept | Description |
|---|---|
| `address` | 20-byte Ethereum address type |
| `mapping` | Key-value store (like a dictionary) |
| `event` | Emits a log to the blockchain (cheap, off-chain readable) |
| `constructor` | Runs once at deploy time |
| `modifier` | Reusable function guard |
| `require` | Reverts the transaction if condition is false |
| `msg.sender` | The wallet address calling the current function |
| `block.timestamp` | Current block's Unix timestamp (in seconds) |
| `public` | Accessible from outside the contract |
| `private` | Only accessible within the contract |
| `view` | Read-only function, no gas cost when called externally |
| `memory` | Temporary data — lives only during the function call |
| `storage` | Persistent data — lives on the blockchain forever |
| `emit` | Fires an event |

---

## 🛡️ Security Considerations

1. **`onlyOwner` modifier** — Prevents unauthorized wallets from storing hashes. Without this, anyone could pollute the contract with fake certificates.
2. **Duplicate check** — `require(!certificateHashes[certHash], ...)` prevents overwriting or double-storing a hash.
3. **Private key in `.env`** — The private key never appears in source code. `.gitignore` ensures it's never committed.
4. **Testnet first** — The contract runs on Sepolia (fake ETH) during development, so mistakes cost nothing real.
5. **Immutability** — Once a hash is stored, it cannot be deleted or changed. This is a feature (tamper-proof) and a limitation (no corrections possible without a new contract).

---

## 🔮 Possible Extensions to the Contract

```solidity
// 1. Role-based issuers (multiple admins)
mapping(address => bool) public authorizedIssuers;

// 2. Certificate revocation
mapping(string => bool) public revokedHashes;

// 3. Timestamp retrieval
mapping(string => uint256) public issuedAt;

// 4. Owner transfer
function transferOwnership(address newOwner) public onlyOwner {
    owner = newOwner;
}
```

---

<div align="center">
  <p><em>Built with Hardhat 3 + Solidity 0.8.19 + ethers.js v6 — on Ethereum Sepolia Testnet</em></p>
</div>

[![parth-builds Github Repo Footer](https://github.com/user-attachments/assets/4bef3a04-16ee-4484-a52c-4f31182e1916)](https://github.com/parthnarkar)
