import web3 from '../web3';
import lottery from '../Lottery.json';
import LotteryContractInterface from '../types/interfaces/LotteryContractInterface';

/**
 * Service responsable de toutes les interactions avec le contrat de loterie
 * Responsabilité : Gestion des appels au smart contract
 */
class LotteryService {
  private contractInstance: LotteryContractInterface | null = null;
  private contractAddress: string;

  constructor() {
    this.contractAddress = import.meta.env.VITE_LOTTERY_ADDRESS;
    this.initializeContract();
  }

  /**
   * Initialise l'instance du contrat
   */
  private initializeContract(): void {
    if (!this.contractAddress) {
      throw new Error("Contract address not found in environment variables");
    }

    this.contractInstance = new web3.eth.Contract(
      lottery.abi,
      this.contractAddress
    ) as LotteryContractInterface;
  }

  /**
   * Récupère le nombre de participants
   */
  async getNumberOfParticipants(): Promise<string> {
    if (!this.contractInstance) {
      throw new Error("Contract not initialized");
    }
    return await this.contractInstance.methods.getNumberOfParticipants().call();
  }

  /**
   * Récupère l'adresse du propriétaire du contrat
   */
  async getOwner(): Promise<string> {
    if (!this.contractInstance) {
      throw new Error("Contract not initialized");
    }
    return await this.contractInstance.methods.owner().call();
  }

  /**
   * Récupère le montant du jackpot en Wei
   */
  async getJackpotWei(): Promise<string> {
    if (!this.contractInstance) {
      throw new Error("Contract not initialized");
    }
    return await this.contractInstance.methods.getJackPot().call();
  }

  /**
   * Récupère le montant du jackpot en Ether
   */
  async getJackpotEther(): Promise<string> {
    const jackpotWei = await this.getJackpotWei();
    return web3.utils.fromWei(jackpotWei, 'ether');
  }

  /**
   * Valide le montant de la mise
   */
  private validateBetAmount(betAmount: string): void {
    const betAmountFloat = parseFloat(betAmount);
    
    if (isNaN(betAmountFloat)) {
      throw new Error("Le montant de la mise doit être un nombre valide");
    }
    
    if (betAmountFloat < 1) {
      throw new Error("Le montant minimum de la mise est de 1 ETH");
    }
    
    if (betAmountFloat > 1000) {
      throw new Error("Le montant maximum de la mise est de 1000 ETH");
    }
  }

  /**
   * Inscrit un participant à la loterie avec un montant personnalisé
   */
  async enrollParticipant(
    participantName: string, 
    fromAccount: string,
    betAmount: string
  ): Promise<void> {
    if (!this.contractInstance) {
      throw new Error("Contract not initialized");
    }

    // Validation du montant
    this.validateBetAmount(betAmount);

    // Conversion du montant en Wei
    const betAmountWei = web3.utils.toWei(betAmount, 'ether');

    console.log(`Enrolling participant: ${participantName} with bet: ${betAmount} ETH (${betAmountWei} Wei)`);

    try {
      await this.contractInstance.methods.enroleInLottery(participantName).send({
        from: fromAccount,
        value: betAmountWei, // Montant personnalisé
        gas: 3000000,
        gasPrice: web3.utils.toWei('20', 'gwei'),
      });
    } catch (error) {
      console.error('Error in enrollParticipant:', error);
      
      // Gestion des erreurs spécifiques
      if (error.message.includes('insufficient funds')) {
        throw new Error("Fonds insuffisants pour effectuer cette transaction");
      } else if (error.message.includes('User denied')) {
        throw new Error("Transaction annulée par l'utilisateur");
      } else if (error.message.includes('gas')) {
        throw new Error("Erreur de gas - la transaction a échoué");
      } else {
        throw new Error("Erreur lors de l'inscription à la loterie");
      }
    }
  }

  /**
   * Calcule les frais de gas estimés pour une transaction
   */
  async estimateGasForEnrollment(
    participantName: string,
    fromAccount: string,
    betAmount: string
  ): Promise<string> {
    if (!this.contractInstance) {
      throw new Error("Contract not initialized");
    }

    this.validateBetAmount(betAmount);
    const betAmountWei = web3.utils.toWei(betAmount, 'ether');

    try {
      const gasEstimate: any = await this.contractInstance.methods
        .enroleInLottery(participantName)
        .estimateGas({
          from: fromAccount,
          value: betAmountWei
        });
      
      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      return "3000000"; // Valeur par défaut
    }
  }

  /**
   * Récupère toutes les informations du contrat en une fois
   */
  async getContractInfo(): Promise<{
    participants: string;
    owner: string;
    jackpot: string;
  }> {
    const [participants, owner, jackpot] = await Promise.all([
      this.getNumberOfParticipants(),
      this.getOwner(),
      this.getJackpotEther()
    ]);

    return { participants, owner, jackpot };
  }

  /**
   * Formate un montant ETH pour l'affichage
   */
  formatEthAmount(amount: string, decimals: number = 4): string {
    const amountFloat = parseFloat(amount);
    return amountFloat.toFixed(decimals);
  }

  /**
   * Convertit Wei en Ether
   */
  weiToEther(weiAmount: string): string {
    return web3.utils.fromWei(weiAmount, 'ether');
  }

  /**
   * Convertit Ether en Wei
   */
  etherToWei(etherAmount: string): string {
    return web3.utils.toWei(etherAmount, 'ether');
  }
}

export default LotteryService;