import web3 from '../web3';

/**
 * Service responsable de la gestion des comptes et balances
 * Responsabilité : Interaction avec les portefeuilles Ethereum
 */
class WalletService {
  
  /**
   * Récupère tous les comptes disponibles
   */
  async getAccounts(): Promise<string[]> {
    try {
      return await web3.eth.getAccounts();
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
      return (await web3.eth.getBalance(account)).toString();
    } catch (error) {
      console.error(`Error getting balance for account ${account}:`, error);
      throw new Error(`Failed to get balance for account ${account}`);
    }
  }

  /**
   * Récupère la balance d'un compte en Ether
   */
  async getBalanceEther(account: string): Promise<string> {
    const balanceWei = await this.getBalanceWei(account);
    return web3.utils.fromWei(balanceWei, "ether");
  }

  /**
   * Récupère les balances de plusieurs comptes (max 10)
   */
  async getMultipleBalances(accounts: string[], maxCount: number = 10): Promise<string[]> {
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
}

export default WalletService;