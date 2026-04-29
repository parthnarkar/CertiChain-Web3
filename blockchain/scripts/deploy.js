import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  console.log("Deploying CertificateVerifier contract...");

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const artifact = await hre.artifacts.readArtifact("CertificateVerifier");

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});