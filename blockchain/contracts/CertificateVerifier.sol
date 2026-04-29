// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateVerifier {
    // 'address' is a wallet address type in Solidity
    // The person who deploys this contract becomes the owner
    address public owner;

    // this creates a object/array-like to store certificate hashes
    mapping(string => bool) private certificateHashes;

    // event is like a log
    // When a certificate is stored, this event is emitted and saved in blockchain logs.
    event CertificateStored(string hash, address storedBy, uint256 timestamp);

    // Constructor runs ONCE at deployment
    // msg.sender = the wallet that deployed this contract
    constructor() {
        owner = msg.sender;
    }

    // 'modifier' is reusable condition check
    // We use it to restrict certain functions to the owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // Store a certificate hash on blockchain
    // Only admin (owner) can call this
    // This WRITES to blockchain → costs gas → creates a transaction
    function storeCertificate(string memory certHash) public onlyOwner {
        require(!certificateHashes[certHash], "Certificate already exists");

        //store the hash
        certificateHashes[certHash] = true;

        // Emit an event (logged on blockchain)
        emit CertificateStored(certHash, msg.sender, block.timestamp);
    }

    // Verify if a certificate hash exists on blockchain
    // This READS data → free, no gas needed
    function verifyCertificate(
        string memory certHash
    ) public view returns (bool) {
        return certificateHashes[certHash];
    }
}
