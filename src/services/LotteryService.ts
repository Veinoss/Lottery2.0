import { getWeb3 } from "../web3";
import lottery from "../Lottery.json";
import LotteryContractInterface from "../types/interfaces/LotteryContractInterface";
import Web3 from "web3";

/**
 * Service responsable de toutes les interactions avec le contrat de loterie
 * Version finale corrigée pour correspondre au contrat Solidity
 */
class LotteryService {
  private contractInstance: LotteryContractInterface | null = null;
  private contractAddress: string;
  private web3Instance: Web3 | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.contractAddress = import.meta.env.VITE_LOTTERY_ADDRESS;
  }

  /**
   * Initialise Web3 et le contrat de façon asynchrone
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized && this.contractInstance && this.web3Instance) {
      return;
    }

    try {
      console.log("🔧 Initialisation du LotteryService...");

      this.web3Instance = await getWeb3();

      if (!this.web3Instance) {
        throw new Error("Web3 instance not available");
      }

      if (!this.contractAddress) {
        console.warn("⚠️ Contract address not found in environment variables");
        this.isInitialized = true;
        return;
      }

      // Vérifier que le contrat existe à cette adresse
      const code = await this.web3Instance.eth.getCode(this.contractAddress);
      if (code === '0x') {
        console.warn("⚠️ Aucun contrat trouvé à l'adresse:", this.contractAddress);
        this.isInitialized = true;
        return;
      }

      this.contractInstance = new this.web3Instance.eth.Contract(
        lottery.abi,
        this.contractAddress
      ) as LotteryContractInterface;

      this.isInitialized = true;
      console.log("✅ LotteryService initialisé avec succès");
      console.log("  - Adresse du contrat:", this.contractAddress);
      console.log("  - Contrat détecté:", code.length > 2 ? "Oui" : "Non");
      
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation du LotteryService:", error);
      this.isInitialized = true;
    }
  }

  /**
   * Vérifie si le contrat est disponible
   */
  private async ensureContractAvailable(): Promise<void> {
    await this.ensureInitialized();

    if (!this.contractInstance) {
      throw new Error("Smart contract non disponible. Vérifiez le déploiement et l'adresse du contrat.");
    }
  }

  /**
   * Test individuel de chaque méthode du contrat
   */
  private async testContractMethods(): Promise<{
    participants: boolean;
    owner: boolean;
    jackpot: boolean;
  }> {
    const results = { participants: false, owner: false, jackpot: false };

    try {
      console.log("🧪 Test des méthodes du contrat...");
      
      // Test getNumberOfParticipants
      try {
        const participants = await this.contractInstance!.methods.getNumberOfParticipants().call();
        console.log("✅ getNumberOfParticipants:", participants);
        results.participants = true;
      } catch (error) {
        console.error("❌ getNumberOfParticipants:", error);
      }

      // Test owner
      try {
        const owner = await this.contractInstance!.methods.owner().call();
        console.log("✅ owner:", owner);
        results.owner = true;
      } catch (error) {
        console.error("❌ owner:", error);
      }

      // Test getJackPot
      try {
        const jackpot = await this.contractInstance!.methods.getJackPot().call();
        console.log("✅ getJackPot:", jackpot);
        results.jackpot = true;
      } catch (error) {
        console.error("❌ getJackPot:", error);
      }

    } catch (error) {
      console.error("❌ Erreur lors du test des méthodes:", error);
    }

    return results;
  }

  /**
   * Récupère le nombre de participants (avec gestion d'erreur individuelle)
   */
  async getNumberOfParticipants(): Promise<string> {
    await this.ensureContractAvailable();
    
    try {
      const result = await this.contractInstance!.methods.getNumberOfParticipants().call();
      return result.toString();
    } catch (error) {
      console.error("❌ Erreur getNumberOfParticipants:", error);
      throw new Error("Impossible de récupérer le nombre de participants");
    }
  }

  /**
   * Récupère l'adresse du propriétaire du contrat
   */
  async getOwner(): Promise<string> {
    await this.ensureContractAvailable();
    
    try {
      const result = await this.contractInstance!.methods.owner().call();
      return result.toString();
    } catch (error) {
      console.error("❌ Erreur getOwner:", error);
      throw new Error("Impossible de récupérer le propriétaire");
    }
  }

  /**
   * Récupère le montant du jackpot en Wei
   */
  async getJackpotWei(): Promise<string> {
    await this.ensureContractAvailable();
    
    try {
      const result = await this.contractInstance!.methods.getJackPot().call();
      return result.toString();
    } catch (error) {
      console.error("❌ Erreur getJackpotWei:", error);
      throw new Error("Impossible de récupérer le jackpot");
    }
  }

  /**
   * Récupère le montant du jackpot en Ether
   */
  async getJackpotEther(): Promise<string> {
    await this.ensureInitialized();

    if (!this.web3Instance) {
      throw new Error("Web3 not available");
    }

    try {
      const jackpotWei = await this.getJackpotWei();
      return this.web3Instance.utils.fromWei(jackpotWei, "ether");
    } catch (error) {
      console.error("❌ Erreur getJackpotEther:", error);
      return "0";
    }
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
   * Inscrit un participant à la loterie
   */
  async enrollParticipant(
    participantName: string,
    fromAccount: string,
    betAmount: string
  ): Promise<void> {
    await this.ensureContractAvailable();

    if (!this.web3Instance) {
      throw new Error("Web3 not available");
    }

    // Validation du montant
    this.validateBetAmount(betAmount);

    // Conversion du montant en Wei
    const betAmountWei = this.web3Instance.utils.toWei(betAmount, "ether");

    console.log(`Enrolling participant: ${participantName} with bet: ${betAmount} ETH (${betAmountWei} Wei)`);

    try {
      await this.contractInstance!.methods.enroleInLottery(participantName).send({
        from: fromAccount,
        value: betAmountWei,
        gas: 3000000,
        gasPrice: this.web3Instance.utils.toWei("20", "gwei"),
      });
    } catch (error: any) {
      console.error("Error in enrollParticipant:", error);

      if (error.message?.includes("insufficient funds")) {
        throw new Error("Fonds insuffisants pour effectuer cette transaction");
      } else if (error.message?.includes("User denied")) {
        throw new Error("Transaction annulée par l'utilisateur");
      } else if (error.message?.includes("gas")) {
        throw new Error("Erreur de gas - la transaction a échoué");
      } else {
        throw new Error("Erreur lors de l'inscription à la loterie");
      }
    }
  }

  /**
   * Récupère toutes les informations du contrat - VERSION CORRIGÉE
   */
  async getContractInfo(): Promise<{
    participants: string;
    owner: string;
    jackpot: string;
  }> {
    try {
      await this.ensureInitialized();

      if (!this.contractInstance) {
        console.warn("⚠️ Contrat non disponible, utilisation de données factices");
        return {
          participants: "0",
          owner: "Non disponible",
          jackpot: "0",
        };
      }

      // Faire un test des méthodes d'abord
      const methodTests = await this.testContractMethods();
      console.log("📊 Résultats des tests:", methodTests);

      // Essayer de récupérer les informations une par une
      let participants = "0";
      let owner = "Non disponible";
      let jackpot = "0";

      // Test participants
      if (methodTests.participants) {
        try {
          participants = await this.getNumberOfParticipants();
        } catch (error) {
          console.warn("⚠️ Erreur récupération participants:", error);
        }
      }

      // Test owner
      if (methodTests.owner) {
        try {
          owner = await this.getOwner();
        } catch (error) {
          console.warn("⚠️ Erreur récupération owner:", error);
        }
      }

      // Test jackpot
      if (methodTests.jackpot) {
        try {
          jackpot = await this.getJackpotEther();
        } catch (error) {
          console.warn("⚠️ Erreur récupération jackpot:", error);
        }
      }

      console.log("📋 Informations récupérées:", { participants, owner, jackpot });

      return { participants, owner, jackpot };

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des informations du contrat:", error);

      return {
        participants: "0",
        owner: "Erreur",
        jackpot: "0",
      };
    }
  }

  /**
   * Diagnostic complet du contrat
   */
  async diagnoseContract(): Promise<void> {
    console.log("🔍 === DIAGNOSTIC DU CONTRAT ===");
    
    try {
      await this.ensureInitialized();
      
      if (!this.contractInstance || !this.web3Instance) {
        console.log("❌ Contrat ou Web3 non initialisé");
        return;
      }

      console.log("📍 Adresse du contrat:", this.contractAddress);
      
      // Vérifier le code du contrat
      const code = await this.web3Instance.eth.getCode(this.contractAddress);
      console.log("📜 Code du contrat présent:", code !== '0x' ? "Oui" : "Non");
      console.log("📏 Taille du code:", code.length);

      // Tester chaque méthode
      await this.testContractMethods();

      // Informations réseau
      const blockNumber = await this.web3Instance.eth.getBlockNumber();
      const chainId = await this.web3Instance.eth.getChainId();
      console.log("🌐 Block actuel:", blockNumber.toString());
      console.log("🔗 Chain ID:", chainId.toString());

    } catch (error) {
      console.error("❌ Erreur diagnostic:", error);
    }
    
    console.log("🔍 === FIN DIAGNOSTIC ===");
  }

  /**
   * Vérifie si le service est prêt
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
   * Vérifie si le contrat est disponible
   */
  async isContractAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.contractInstance !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtient l'adresse du contrat
   */
  getContractAddress(): string {
    return this.contractAddress || "Non configuré";
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
  async weiToEther(weiAmount: string): Promise<string> {
    await this.ensureInitialized();
    if (!this.web3Instance) {
      throw new Error("Web3 not available");
    }
    return this.web3Instance.utils.fromWei(weiAmount, "ether");
  }

  /**
   * Convertit Ether en Wei
   */
  async etherToWei(etherAmount: string): Promise<string> {
    await this.ensureInitialized();
    if (!this.web3Instance) {
      throw new Error("Web3 not available");
    }
    return this.web3Instance.utils.toWei(etherAmount, "ether");
  }
}

export default LotteryService;