import { getWeb3 } from '../web3'; // ✅ Utiliser getWeb3 au lieu d'importer web3 directement
import Web3 from 'web3';

/**
 * Service responsable de la gestion des comptes et balances
 * Version corrigée avec initialisation asynchrone
 */
class WalletService {
  private web3Instance: Web3 | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialise Web3 de façon asynchrone
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized && this.web3Instance) {
      return; // Déjà initialisé
    }

    try {
      console.log("🔧 Initialisation du WalletService...");
      
      // Obtenir l'instance Web3 initialisée
      this.web3Instance = await getWeb3();
      
      if (!this.web3Instance) {
        throw new Error("Web3 instance not available");
      }

      this.isInitialized = true;
      console.log("✅ WalletService initialisé avec succès");
      
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation du WalletService:", error);
      this.isInitialized = true; // Marquer comme initialisé même en cas d'erreur
      throw error;
    }
  }

  /**
   * Vérifie que Web3 est disponible
   */
  private async ensureWeb3Available(): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.web3Instance) {
      throw new Error("Web3 non disponible. Vérifiez la connexion.");
    }
  }
  
  /**
   * Récupère tous les comptes disponibles
   */
  async getAccounts(): Promise<string[]> {
    try {
      await this.ensureWeb3Available();
      return await this.web3Instance!.eth.getAccounts();
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw new Error("Failed to get accounts");
    }
  }

  /**
   * Récupère la balance d'un compte en Wei
   */
  async getBalanceWei(account: string): Promise<string> {
    try {
      await this.ensureWeb3Available();
      return (await this.web3Instance!.eth.getBalance(account)).toString();
    } catch (error) {
      console.error(`Error getting balance for account ${account}:`, error);
      throw new Error(`Failed to get balance for account ${account}`);
    }
  }

  /**
   * Récupère la balance d'un compte en Ether
   */
  async getBalanceEther(account: string): Promise<string> {
    await this.ensureWeb3Available();
    const balanceWei = await this.getBalanceWei(account);
    return this.web3Instance!.utils.fromWei(balanceWei, "ether");
  }

  /**
   * Récupère les balances de plusieurs comptes (max 10)
   */
  async getMultipleBalances(accounts: string[], maxCount: number = 10): Promise<string[]> {
    await this.ensureWeb3Available();
    
    const accountsToProcess = accounts.slice(0, maxCount);

    try {
      // Traitement en parallèle pour optimiser les performances
      const balancePromises = accountsToProcess.map(account => 
        this.getBalanceEther(account)
      );
      
      return await Promise.all(balancePromises);
    } catch (error) {
      console.error("Error getting multiple balances:", error);
      throw new Error("Failed to get account balances");
    }
  }

  /**
   * Vérifie si un compte a suffisamment de fonds pour une transaction
   */
  async hasSufficientBalance(account: string, requiredAmount: string): Promise<boolean> {
    try {
      const balance = await this.getBalanceEther(account);
      return parseFloat(balance) >= parseFloat(requiredAmount);
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  }

  /**
   * Formate une balance pour l'affichage
   */
  formatBalance(balance: string, decimals: number = 4): string {
    return parseFloat(balance).toFixed(decimals);
  }

  /**
   * Valide qu'un index de compte est valide
   */
  isValidAccountIndex(index: number, accounts: string[]): boolean {
    return index >= 0 && index < accounts.length;
  }

  /**
   * Récupère un compte par son index
   */
  getAccountByIndex(accounts: string[], index: number): string | null {
    if (!this.isValidAccountIndex(index, accounts)) {
      return null;
    }
    return accounts[index];
  }

  /**
   * Obtient les détails complets d'un compte
   */
  async getAccountDetails(account: string): Promise<{
    address: string;
    balanceWei: string;
    balanceEther: string;
    balanceFormatted: string;
  }> {
    await this.ensureWeb3Available();
    
    const balanceWei = await this.getBalanceWei(account);
    const balanceEther = await this.getBalanceEther(account);
    const balanceFormatted = this.formatBalance(balanceEther);

    return {
      address: account,
      balanceWei,
      balanceEther,
      balanceFormatted
    };
  }

  /**
   * Convertit Wei en Ether (utilise l'instance Web3 locale)
   */
  async weiToEther(weiAmount: string): Promise<string> {
    await this.ensureWeb3Available();
    return this.web3Instance!.utils.fromWei(weiAmount, 'ether');
  }

  /**
   * Convertit Ether en Wei (utilise l'instance Web3 locale)
   */
  async etherToWei(etherAmount: string): Promise<string> {
    await this.ensureWeb3Available();
    return this.web3Instance!.utils.toWei(etherAmount, 'ether');
  }

  /**
   * Vérifie si le service est prêt à être utilisé
   */
  async isReady(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.isInitialized && this.web3Instance !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtient les informations de transaction pour un compte
   */
  async getTransactionCount(account: string): Promise<number> {
    try {
      await this.ensureWeb3Available();
      return await this.web3Instance!.eth.getTransactionCount(account);
    } catch (error) {
      console.error(`Error getting transaction count for ${account}:`, error);
      throw new Error(`Failed to get transaction count for ${account}`);
    }
  }

  /**
   * Estime le gas nécessaire pour une transaction
   */
  async estimateGas(transactionObject: {
    from: string;
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> {
    try {
      await this.ensureWeb3Available();
      const gasEstimate = await this.web3Instance!.eth.estimateGas(transactionObject);
      return gasEstimate.toString();
    } catch (error) {
      console.error("Error estimating gas:", error);
      throw new Error("Failed to estimate gas");
    }
  }

  /**
   * Obtient le prix actuel du gas
   */
  async getGasPrice(): Promise<string> {
    try {
      await this.ensureWeb3Available();
      const gasPrice = await this.web3Instance!.eth.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      console.error("Error getting gas price:", error);
      throw new Error("Failed to get gas price");
    }
  }

  /**
   * Valide qu'une adresse Ethereum est correcte
   */
  async isValidAddress(address: string): Promise<boolean> {
    try {
      await this.ensureWeb3Available();
      return this.web3Instance!.utils.isAddress(address);
    } catch (error) {
      console.error("Error validating address:", error);
      return false;
    }
  }

  /**
   * Formate une adresse pour l'affichage (version tronquée)
   */
  formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
    if (!address || address.length <= startLength + endLength) {
      return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  }

  /**
   * Obtient un résumé de tous les comptes
   */
  async getAllAccountsSummary(maxAccounts: number = 10): Promise<Array<{
    index: number;
    address: string;
    addressFormatted: string;
    balance: string;
    balanceFormatted: string;
  }>> {
    try {
      await this.ensureWeb3Available();
      
      const accounts = await this.getAccounts();
      const balances = await this.getMultipleBalances(accounts, maxAccounts);
      
      return accounts.slice(0, maxAccounts).map((account, index) => ({
        index,
        address: account,
        addressFormatted: this.formatAddress(account),
        balance: balances[index] || "0",
        balanceFormatted: this.formatBalance(balances[index] || "0")
      }));
      
    } catch (error) {
      console.error("Error getting accounts summary:", error);
      throw new Error("Failed to get accounts summary");
    }
  }
}

export default WalletService;