import { Component } from "react";
import './assets/App.css';

// Services avec barrel exports
import { LotteryService, WalletService, ParticleService } from './services';
import { getWeb3, Web3Config } from './web3';

// Types
import AppPropsInterface from "./types/interfaces/AppPropsInterface";
import AppState from './types/AppState';

// Components avec barrel exports
import {
  Header,
  StatsGrid,
  BalanceList,
  ParticipationForm,
  WalletAddress,
  FloatingParticles
} from './components';
import Web3Diagnostic from "./components/Web3Diagnostic";

/**
 * Composant principal App - Version avec gestion asynchrone des services
 */
class App extends Component<AppPropsInterface, AppState> {
  private lotteryService: LotteryService;
  private walletService: WalletService;
  private particleService: ParticleService;

  constructor(props: AppPropsInterface) {
    super(props);
    
    // Initialisation des services (maintenant safe)
    this.lotteryService = new LotteryService();
    this.walletService = new WalletService();
    this.particleService = new ParticleService();

    // État initial de l'application
    this.state = {
      accounts: [],
      balanceInEther: [],
      owner: "",
      players: "",
      value: "",
      selectedAccount: "",
      jackpot: "",
      name: "",
      betAmount: "1",
      succesMsg: "",
      isLoading: false,
      particles: [],
      isWeb3Ready: false,    // Nouveau: état de Web3
      networkInfo: null      // Nouveau: informations réseau
    };
  }

  /**
   * Initialisation au montage du composant
   */
  async componentDidMount(): Promise<void> {      
    try {
      this.setState({ isLoading: true });
      await this.initializeApplication();
    } catch (error) {
      console.error("Error in componentDidMount:", error);
      this.handleError("Erreur lors de l'initialisation de l'application");
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Initialise l'application avec vérifications étendues
   */
  private async initializeApplication(): Promise<void> {
    try {
      // 1. Vérifier que Web3 est prêt
      console.log("🔄 Initialisation de Web3...");
      const web3 = await getWeb3();
      
      // 2. Vérifier la connexion
      const isConnected = await Web3Config.isConnected();
      if (!isConnected) {
        throw new Error("Web3 n'est pas connecté");
      }

      // 3. Obtenir les informations réseau
      const networkInfo = await Web3Config.getNetworkInfo();
      console.log("🌐 Réseau connecté:", {
        chainId: networkInfo.chainId.toString(),
        blockNumber: networkInfo.blockNumber.toString()
      });

      this.setState({ 
        isWeb3Ready: true, 
        networkInfo 
      });

      // 4. Vérifier que les services sont prêts
      console.log("🔧 Vérification des services...");
      const lotteryServiceReady = await this.lotteryService.isReady();
      console.log("✅ LotteryService prêt:", lotteryServiceReady);

      // 5. Chargement des comptes
      console.log("👛 Récupération des comptes...");
      const accounts: string[] = await this.walletService.getAccounts();
      console.log("✅ Comptes récupérés:", accounts.length);

      if (accounts.length === 0) {
        throw new Error("Aucun compte disponible. Vérifiez votre portefeuille.");
      }

      // 6. Chargement des balances
      console.log("💰 Récupération des balances...");
      const balances = await this.walletService.getMultipleBalances(accounts);
      console.log("✅ Balances récupérées:", balances.length);

      // 7. Tentative de chargement des informations du contrat
      console.log("📋 Récupération des informations du contrat...");
      let contractInfo;
      
      try {
        // Vérifier si le contrat est disponible
        const isContractAvailable = await this.lotteryService.isContractAvailable();
        console.log("📄 Contrat disponible:", isContractAvailable);
        
        if (isContractAvailable) {
          contractInfo = await this.lotteryService.getContractInfo();
          console.log("✅ Informations du contrat:", contractInfo);
        } else {
          console.warn("⚠️ Contrat non disponible, utilisation de données par défaut");
          contractInfo = {
            owner: "Non disponible",
            participants: "0",
            jackpot: "0"
          };
          this.showMessage("⚠️ Contrat non disponible. Mode démo activé.", 5000);
        }
      } catch (contractError) {
        console.warn("⚠️ Erreur contrat:", contractError);
        contractInfo = {
          owner: "Erreur",
          participants: "0", 
          jackpot: "0"
        };
        this.showMessage("⚠️ Erreur lors du chargement du contrat.", 5000);
      }

      // 8. Génération des particules
      const particles = this.particleService.generateParticles();

      // 9. Mise à jour de l'état
      this.setState({
        accounts,
        balanceInEther: balances,
        owner: contractInfo.owner,
        players: contractInfo.participants,
        jackpot: contractInfo.jackpot,
        particles
      });

      console.log("🎉 Application initialisée avec succès!");

    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error);
      await this.diagnoseError(error);
      throw error;
    }
  }

  /**
   * Diagnostic avancé des erreurs
   */
  private async diagnoseError(error: any): Promise<void> {
    console.log("🔍 Diagnostic des erreurs...");

    try {
      // Vérifier Web3
      const web3 = await getWeb3();
      console.log("✅ Web3 instance:", !!web3);

      // Vérifier la connexion
      const isConnected = await Web3Config.isConnected();
      console.log("✅ Web3 connecté:", isConnected);

      if (isConnected) {
        // Vérifier les informations réseau
        const networkInfo = await Web3Config.getNetworkInfo();
        console.log("✅ Network ID:", networkInfo.networkId.toString());
        console.log("✅ Chain ID:", networkInfo.chainId.toString());
        console.log("✅ Block Number:", networkInfo.blockNumber.toString());
      }

      // Vérifier les services
      const lotteryReady = await this.lotteryService.isReady();
      const contractAvailable = await this.lotteryService.isContractAvailable();
      console.log("✅ LotteryService prêt:", lotteryReady);
      console.log("✅ Contrat disponible:", contractAvailable);
      console.log("✅ Adresse du contrat:", this.lotteryService.getContractAddress());

    } catch (diagError) {
      console.error("❌ Erreur lors du diagnostic:", diagError);
    }

    // Messages d'aide basés sur l'erreur
    if (error.message?.includes("Contract") || error.message?.includes("contrat")) {
      this.showMessage("❌ Problème de contrat: Vérifiez le déploiement et l'adresse", 8000);
    } else if (error.message?.includes("User denied")) {
      this.showMessage("⚠️ Accès refusé. Autorisez la connexion dans MetaMask", 5000);
    } else if (error.message?.includes("not connected")) {
      this.showMessage("❌ Web3 non connecté. Vérifiez MetaMask ou Ganache", 5000);
    }
  }

  /**
   * Gère les changements du compte sélectionné
   */
  private handleAccountChange = (selectedAccount: string): void => {
    this.setState({ selectedAccount });
  };

  /**
   * Gère les changements du nom du participant
   */
  private handleNameChange = (name: string): void => {
    this.setState({ name });
  };

  /**
   * Gère les changements du montant de la mise
   */
  private handleBetAmountChange = (betAmount: string): void => {
    if (betAmount === '' || /^\d*\.?\d*$/.test(betAmount)) {
      this.setState({ betAmount });
    }
  };

  /**
   * Valide les données du formulaire avant soumission
   */
  private validateForm(): boolean {
    const { name, selectedAccount, betAmount, accounts, balanceInEther, isWeb3Ready } = this.state;

    if (!isWeb3Ready) {
      this.showMessage("⚠️ Web3 n'est pas prêt. Veuillez patienter.", 3000);
      return false;
    }

    if (!name || selectedAccount === '') {
      this.showMessage("⚠️ Veuillez remplir tous les champs!", 3000);
      return false;
    }

    if (!betAmount || betAmount === '') {
      this.showMessage("⚠️ Veuillez saisir un montant!", 3000);
      return false;
    }

    const betAmountFloat = parseFloat(betAmount);
    
    if (isNaN(betAmountFloat) || betAmountFloat < 1) {
      this.showMessage("⚠️ Le montant minimum est de 1 ETH!", 3000);
      return false;
    }

    // Vérifier que l'utilisateur a suffisamment de fonds
    const accountIndex = typeof selectedAccount === 'string' ? parseInt(selectedAccount) : selectedAccount;
    const accountBalance = balanceInEther[accountIndex];
    
    if (accountBalance && parseFloat(accountBalance) < betAmountFloat) {
      this.showMessage("⚠️ Solde insuffisant pour cette mise!", 3000);
      return false;
    }

    return true;
  }

  /**
   * Vérifie si le contrat est disponible avant la transaction
   */
  private async validateContractAvailability(): Promise<boolean> {
    const isContractAvailable = await this.lotteryService.isContractAvailable();
    
    if (!isContractAvailable) {
      this.showMessage("❌ Smart contract non disponible. Impossible d'effectuer la transaction.", 5000);
      return false;
    }
    
    return true;
  }

  /**
   * Gère la soumission du formulaire de participation
   */
  private handleParticipationSubmit = async (): Promise<void> => {
    if (!this.validateForm()) {
      return;
    }

    // Vérifier la disponibilité du contrat avant de continuer
    if (!(await this.validateContractAvailability())) {
      return;
    }

    this.setState({ isLoading: true, succesMsg: "" });

    try {
      await this.enrollParticipant();
      await this.refreshApplicationData();
      this.handleSuccessfulEnrollment();
    } catch (error) {
      console.error('Error calling enroleInLottery function:', error);
      this.handleEnrollmentError(error);
    }
  };

  /**
   * Inscrit le participant à la loterie via le service
   */
  private async enrollParticipant(): Promise<void> {
    const selectedAccountIndex = typeof this.state.selectedAccount === 'string' 
      ? parseInt(this.state.selectedAccount) 
      : this.state.selectedAccount;

    const selectedAccount = this.walletService.getAccountByIndex(
      this.state.accounts, 
      selectedAccountIndex
    );

    if (!selectedAccount) {
      throw new Error("Invalid account selected");
    }

    await this.lotteryService.enrollParticipant(
      this.state.name, 
      selectedAccount, 
      this.state.betAmount
    );
  }

  /**
   * Rafraîchit les données après une transaction réussie
   */
  private async refreshApplicationData(): Promise<void> {
    const [contractInfo, balances] = await Promise.all([
      this.lotteryService.getContractInfo(),
      this.walletService.getMultipleBalances(this.state.accounts)
    ]);

    this.setState({
      players: contractInfo.participants,
      jackpot: contractInfo.jackpot,
      balanceInEther: balances
    });
  }

  /**
   * Gère le succès de l'inscription
   */
  private handleSuccessfulEnrollment(): void {
    this.setState({ 
      name: "",
      selectedAccount: "",
      betAmount: "1",
      isLoading: false
    });

    this.showMessage(`🎉 Merci! Mise de ${this.state.betAmount} ETH effectuée! Bonne chance!`, 5000);
    console.log("Transaction successful - Players:", this.state.players);
    console.log("Transaction successful - Jackpot:", this.state.jackpot);
  }

  /**
   * Gère les erreurs d'inscription avec détail
   */
  private handleEnrollmentError(error: any): void {
    this.setState({ isLoading: false });
    
    let errorMessage = "❌ Erreur lors de la transaction.";
    
    if (error.message?.includes("insufficient funds")) {
      errorMessage = "❌ Fonds insuffisants pour cette transaction.";
    } else if (error.message?.includes("User denied")) {
      errorMessage = "⚠️ Transaction annulée par l'utilisateur.";
    } else if (error.message?.includes("gas")) {
      errorMessage = "❌ Erreur de gas. Ajustez les paramètres.";
    } else if (error.message?.includes("Contract") || error.message?.includes("contrat")) {
      errorMessage = "❌ Erreur de contrat. Vérifiez le déploiement.";
    }
    
    this.showMessage(errorMessage, 5000);
  }

  /**
   * Affiche un message temporaire
   */
  private showMessage(message: string, duration: number): void {
    this.setState({ succesMsg: message });
    
    setTimeout(() => {
      this.setState({ succesMsg: "" });
    }, duration);
  }

  /**
   * Gère les erreurs générales
   */
  private handleError(message: string): void {
    console.error(message);
    this.showMessage(`❌ ${message}`, 5000);
  }

  /**
   * Rendu du composant principal
   */
  render(): JSX.Element {
    const { isWeb3Ready, networkInfo, isLoading } = this.state;

    return (
      <div className="app">
        <div className="background-animation"></div>
        {/* {process.env.NODE_ENV === "development" && <Web3Diagnostic />} */}

        <FloatingParticles particles={this.state.particles} />

        <div className="container">
          <Header />

          {/* Affichage du statut de connexion */}
          {!isWeb3Ready && !isLoading && (
            <div className="connection-status">
              <p>🔄 Connexion à Web3 en cours...</p>
            </div>
          )}

          {/* Affichage du statut général */}
          {isLoading && (
            <div className="connection-status">
              <p>⏳ Chargement de l'application...</p>
            </div>
          )}

          {/* Informations réseau */}
          {networkInfo && (
            <div className="network-info">
              <p>🌐 Réseau: Chain ID {networkInfo.chainId.toString()} | Block #{networkInfo.blockNumber.toString()}</p>
            </div>
          )}

          <StatsGrid 
            participants={this.state.players}
            jackpot={this.state.jackpot}
          />

          <div className="main-content">
            <BalanceList 
              balances={this.state.balanceInEther}
              isLoading={this.state.balanceInEther.length === 0 && isWeb3Ready}
            />

            <ParticipationForm
              selectedAccount={this.state.selectedAccount}
              participantName={this.state.name}
              betAmount={this.state.betAmount}
              balances={this.state.balanceInEther}
              isLoading={this.state.isLoading}
              successMessage={this.state.succesMsg}
              onAccountChange={this.handleAccountChange}
              onNameChange={this.handleNameChange}
              onBetAmountChange={this.handleBetAmountChange}
              onSubmit={this.handleParticipationSubmit}
            />
          </div>

          <WalletAddress 
            accounts={this.state.accounts}
            selectedAccount={this.state.selectedAccount}
          />
        </div>
      </div>
    );
  }
}

export default App;