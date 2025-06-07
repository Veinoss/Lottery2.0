// web3.ts

import Web3 from 'web3';
import WindowInterface from './types/interfaces/WindowInterface';

// Extend Window interface to include ethereum
declare global {
  interface Window extends WindowInterface {}
}

// Define the Ganache URL (the default port is 8545)
const ganacheURL: string = "http://127.0.0.1:8545";

// Initialize web3 instance
let web3: Web3;
let isInitialized = false;

/**
 * Types pour la gestion des providers
 */
type ProviderType = 'metamask' | 'ganache' | 'none';

interface InitializationResult {
  web3: Web3;
  providerType: ProviderType;
  isConnected: boolean;
}

/**
 * Initialise Web3 avec logique de fallback améliorée
 */
async function initializeWeb3(): Promise<Web3> {
  console.log("🚀 Démarrage de l'initialisation Web3...");
  
  const result = await tryInitializeProviders();
  web3 = result.web3;
  isInitialized = true;
  
  console.log(`✅ Web3 initialisé avec ${result.providerType}, connecté: ${result.isConnected}`);
  return web3;
}

/**
 * Essaie d'initialiser les différents providers dans l'ordre de priorité
 */
async function tryInitializeProviders(): Promise<InitializationResult> {
  // 1. Essayer MetaMask en premier
  const metamaskResult = await tryMetaMaskProvider();
  if (metamaskResult.isConnected) {
    return metamaskResult;
  }
  
  // 2. Essayer Ganache en fallback
  const ganacheResult = await tryGanacheProvider();
  if (ganacheResult.isConnected) {
    return ganacheResult;
  }
  
  // 3. Fallback final : Web3 sans provider
  console.warn("⚠️ Aucun provider disponible, initialisation sans provider");
  return {
    web3: new Web3(),
    providerType: 'none',
    isConnected: false
  };
}

/**
 * Tente d'initialiser avec MetaMask
 */
async function tryMetaMaskProvider(): Promise<InitializationResult> {
  if (!window.ethereum) {
    console.log("ℹ️ MetaMask non détecté");
    return {
      web3: new Web3(),
      providerType: 'none',
      isConnected: false
    };
  }

  try {
    console.log("🦊 Tentative de connexion à MetaMask...");
    const web3Instance = new Web3(window.ethereum);
    
    // Demander l'accès aux comptes
    await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // Vérifier la connexion
    const accounts = await web3Instance.eth.getAccounts();
    const blockNumber = await web3Instance.eth.getBlockNumber();
    
    console.log("✅ MetaMask connecté:");
    console.log("  - Comptes:", accounts.length);
    console.log("  - Block:", blockNumber.toString());
    
    // Écouter les changements de compte et de réseau
    setupMetaMaskListeners();
    
    return {
      web3: web3Instance,
      providerType: 'metamask',
      isConnected: true
    };
    
  } catch (error: any) {
    console.warn("⚠️ Erreur MetaMask:", error.message);
    return {
      web3: new Web3(),
      providerType: 'none',
      isConnected: false
    };
  }
}

/**
 * Tente d'initialiser avec Ganache
 */
async function tryGanacheProvider(): Promise<InitializationResult> {
  try {
    console.log("🔧 Tentative de connexion à Ganache...");
    const web3Instance = new Web3(new Web3.providers.HttpProvider(ganacheURL));
    
    // Vérifier la connexion
    const blockNumber = await web3Instance.eth.getBlockNumber();
    const accounts = await web3Instance.eth.getAccounts();
    
    console.log("✅ Ganache connecté:");
    console.log("  - URL:", ganacheURL);
    console.log("  - Block:", blockNumber.toString());
    console.log("  - Comptes:", accounts.length);
    
    return {
      web3: web3Instance,
      providerType: 'ganache',
      isConnected: true
    };
    
  } catch (error: any) {
    console.warn("⚠️ Erreur Ganache:", error.message);
    return {
      web3: new Web3(),
      providerType: 'none',
      isConnected: false
    };
  }
}

/**
 * Configure les listeners pour MetaMask
 */
function setupMetaMaskListeners(): void {
  if (!window.ethereum) return;
  
  // Changement de compte
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    console.log("🔄 Comptes MetaMask changés:", accounts);
    window.location.reload(); // Recharger l'app pour la simplicité
  });
  
  // Changement de réseau
  window.ethereum.on('chainChanged', (chainId: string) => {
    console.log("🌐 Réseau MetaMask changé:", chainId);
    window.location.reload(); // Recharger l'app pour la simplicité
  });
  
  // Connexion/déconnexion
  window.ethereum.on('connect', (connectInfo: any) => {
    console.log("🔗 MetaMask connecté:", connectInfo);
  });
  
  window.ethereum.on('disconnect', (error: any) => {
    console.log("🔌 MetaMask déconnecté:", error);
  });
}

/**
 * Vérifie si Web3 est connecté
 */
async function isWeb3Connected(web3Instance: Web3): Promise<boolean> {
  try {
    await web3Instance.eth.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}

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
  },

  /**
   * Formate un nombre pour l'affichage
   */
  formatNumber: (value: string | number, decimals: number = 4): string => {
    const num = parseFloat(value.toString());
    return num.toFixed(decimals);
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
      if (!isInitialized) {
        await getWeb3(); // S'assurer que Web3 est initialisé
      }
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
    gasPrice: bigint;
  }> => {
    try {
      if (!isInitialized) {
        await getWeb3();
      }
      
      const [networkId, chainId, blockNumber, gasPrice] = await Promise.all([
        web3.eth.net.getId(),
        web3.eth.getChainId(),
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice()
      ]);

      return { networkId, chainId, blockNumber, gasPrice };
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
      if (!isInitialized) {
        await getWeb3();
      }
      const code = await web3.eth.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error("Error checking if address is contract:", error);
      return false;
    }
  },

  /**
   * Change de réseau dans MetaMask
   */
  switchNetwork: async (chainId: string): Promise<void> => {
    if (!window.ethereum) {
      throw new Error("MetaMask not available");
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      console.error("Error switching network:", error);
      throw error;
    }
  },

  /**
   * Obtient le type de provider actuel
   */
  getProviderType: (): ProviderType => {
    if (window.ethereum && web3.currentProvider === window.ethereum) {
      return 'metamask';
    } else if (web3.currentProvider && web3.currentProvider.constructor.name === 'HttpProvider') {
      return 'ganache';
    }
    return 'none';
  },

  /**
   * Reconnecte Web3 si nécessaire
   */
  reconnect: async (): Promise<boolean> => {
    try {
      const newWeb3 = await initializeWeb3();
      const isConnected = await Web3Config.isConnected();
      console.log("🔄 Reconnexion Web3:", isConnected ? "✅" : "❌");
      return isConnected;
    } catch (error) {
      console.error("Erreur lors de la reconnexion:", error);
      return false;
    }
  }
};

// Promise pour l'initialisation asynchrone
let web3Promise: Promise<Web3> | null = null;

/**
 * Obtient l'instance Web3 initialisée
 */
export async function getWeb3(): Promise<Web3> {
  if (!web3Promise) {
    web3Promise = initializeWeb3();
  }
  return web3Promise;
}

/**
 * Force la réinitialisation de Web3
 */
export async function resetWeb3(): Promise<Web3> {
  web3Promise = null;
  isInitialized = false;
  return getWeb3();
}

// Pour la compatibilité, initialiser immédiatement
getWeb3().catch(error => {
  console.error("Error initializing Web3:", error);
});

export default web3;