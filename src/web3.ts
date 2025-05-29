import Web3 from 'web3';
import WindowInterface from './types/interfaces/WindowInterface';

// Extend Window interface to include ethereum
declare global {
  interface Window extends WindowInterface {}
}

// Define the Ganache URL (the default port is 8545)
const ganacheURL: string = "http://127.0.0.1:8545"; // Replace with your Ganache host/port if different

// Initialize web3 instance
let web3: Web3;

/*if (window.ethereum) {
  // Use MetaMask's provider if available
  web3 = new Web3(window.ethereum);
  try {
    window.ethereum.enable(); // Request account access
  } catch (error) {
    console.error("User denied account access", error);
  }
} else {*/
  // Fallback to using Ganache's local provider
  try{
    web3 = new Web3(new Web3.providers.HttpProvider(ganacheURL));
    console.log("Connected to Ganache at:", ganacheURL);
  } catch (error){
    console.error("did NOT connect to ganache:", error);
    // Initialize with default provider if connection fails
    web3 = new Web3();
  }
//}

export default web3;