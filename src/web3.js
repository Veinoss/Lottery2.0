import Web3 from './web3';

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.enable(); // Request account access if needed
} else if (window.web3) {
  web3 = new Web3(window.web3.currentProvider);
} else {
  // Fallback to local Ganache instance if MetaMask is not available
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

export default web3;