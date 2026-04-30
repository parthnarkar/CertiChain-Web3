import { ethers } from 'ethers';
import CertificateVerifierABI from './CertificateVerifier.json';

// deployed contact address
const CONTRACT_ADDRESS = "0xb670BBe87F9e698C757cB0806b3160Ad51951592";

// get the ABI (function definitions) from the JSON
const CONTRACT_ABI = CertificateVerifierABI.abi;

// connect to MetaMask and return a contract instance
export async function getContract() {
  // check if MetaMask is installed
  if (!window.ethereum) {
    throw new error("MetaMask not found. Please install it from metamask.io");
  }

  // ask metamask to connect (user sees a popup)
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // 'provider' connect to Ethereum network via MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);

  // 'signer' is your wallet - needed for transactions (write operations)
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return contract;
}

// Store a certificate hash on blockchain (costs gas)
export async function storeCertificateOnChain(hash) {
  const contract = await getContract();

  // Call the smart contract function
  // This triggers a MetaMask popup asking user to confirm the transaction
  const tx = await contract.storeCertificate(hash);

  // Wait for the transaction to be mined (confirmed on blockchain)
  const receipt = await tx.wait();

  // Return the transaction hash (like a receipt ID)
  return receipt.hash;
}

// Verify if a certificate hash exists on blockchain (free, no gas)
export async function verifyCertificateOnChain(hash) {
  const contract = await getContract();

  const isValid = await contract.verifyCertificate(hash);

  return isValid;
}