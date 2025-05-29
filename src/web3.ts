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

/**
 * Initialise Web3 avec gestion des erreurs et types
 */
function initializeWeb3(): Web3 {
  if (window.ethereum) {
    // Use MetaMask's provider if available
    web3 = new Web3(window.ethereum);
    try {
      window.ethereum.enable(); // Request account access
    } catch (error) {
      console.error("User denied account access", error);
    }
  } 
  else {
    // Fallback to using Ganache's local provider
    try {
      web3 = new Web3(new Web3.providers.HttpProvider(ganacheURL));
      console.log("Connected to Ganache at:", ganacheURL);
    } catch (error) {
      console.error("did NOT connect to ganache:", error);
      // Initialize with default provider if connection fails
      web3 = new Web3();
    }
  }
  
  return web3;
}

// Initialize the web3 instance
web3 = initializeWeb3();

/**
 * Utilitaires Web3 pour la gestion des types
 */
export const Web3Utils = {
  /**
   * Convertit BigInt en string de manière sûre
   */
  bigIntToString: (value: bigint | string | number): string => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value.toString();
  },

  /**
   * Convertit Wei en Ether avec gestion des types
   */
  weiToEther: (weiValue: bigint | string | number): string => {
    const weiString = Web3Utils.bigIntToString(weiValue);
    return web3.utils.fromWei(weiString, 'ether');
  },

  /**
   * Convertit Ether en Wei
   */
  etherToWei: (etherValue: string | number): string => {
    return web3.utils.toWei(etherValue.toString(), 'ether');
  },

  /**
   * Vérifie si une adresse Ethereum est valide
   */
  isValidAddress: (address: string): boolean => {
    return web3.utils.isAddress(address);
  },

  /**
   * Formate une adresse pour l'affichage (tronquée)
   */
  formatAddress: (address: string, startLength: number = 6, endLength: number = 4): string => {
    if (!Web3Utils.isValidAddress(address)) {
      return address;
    }
    if (address.length <= startLength + endLength) {
      return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  },

  /**
   * Convertit Gwei en Wei
   */
  gweiToWei: (gweiValue: string | number): string => {
    return web3.utils.toWei(gweiValue.toString(), 'gwei');
  },

  /**
   * Génère un hash à partir d'une chaîne
   */
  keccak256: (value: string): string => {
    return web3.utils.keccak256(value);
  }
};

/**
 * Configuration Web3 avec vérification de connexion
 */
export const Web3Config = {
  /**
   * Vérifie si Web3 est connecté
   */
  isConnected: async (): Promise<boolean> => {
    try {
      await web3.eth.getBlockNumber();
      return true;
    } catch (error) {
      console.error("Web3 connection check failed:", error);
      return false;
    }
  },

  /**
   * Récupère les informations de réseau
   */
  getNetworkInfo: async (): Promise<{
    networkId: bigint;
    chainId: bigint;
    blockNumber: bigint;
  }> => {
    try {
      const [networkId, chainId, blockNumber] = await Promise.all([
        web3.eth.net.getId(),
        web3.eth.getChainId(),
        web3.eth.getBlockNumber()
      ]);

      return { networkId, chainId, blockNumber };
    } catch (error) {
      console.error("Error getting network info:", error);
      throw error;
    }
  },

  /**
   * Vérifie si l'adresse est un contrat
   */
  isContract: async (address: string): Promise<boolean> => {
    try {
      const code = await web3.eth.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error("Error checking if address is contract:", error);
      return false;
    }
  }
};

export default web3;