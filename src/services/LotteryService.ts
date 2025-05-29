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
   * Inscrit un participant à la loterie
   */
  async enrollParticipant(
    participantName: string, 
    fromAccount: string
  ): Promise<void> {
    if (!this.contractInstance) {
      throw new Error("Contract not initialized");
    }

    await this.contractInstance.methods.enroleInLottery(participantName).send({
      from: fromAccount,
      value: web3.utils.toWei("1", 'ether'),
      gas: 3000000,
      gasPrice: web3.utils.toWei('20', 'gwei'),
    });
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
}

export default LotteryService;