import { Component } from "react";
import './assets/App.css';

// Services avec barrel exports
import { LotteryService, WalletService, ParticleService } from './services';

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

/**
 * Composant principal App - Orchestrateur de l'application
 * Responsabilité : Coordination entre les services et composants UI
 * 
 * Cette version utilise une architecture orientée objet avec séparation des responsabilités :
 * - Services pour la logique métier
 * - Composants pour la présentation
 * - App comme orchestrateur principal
 */
class App extends Component<AppPropsInterface, AppState> {
  private lotteryService: LotteryService;
  private walletService: WalletService;
  private particleService: ParticleService;

  constructor(props: AppPropsInterface) {
    super(props);
    
    // Initialisation des services (Dependency Injection)
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
      betAmount: "1", // Nouveau: montant de la mise (minimum 1 ETH)
      succesMsg: "",
      isLoading: false,
      particles: []
    };
  }

  /**
   * Initialisation au montage du composant
   * Charge toutes les données nécessaires pour l'application
   */
  async componentDidMount(): Promise<void> {      
    try {
      await this.initializeApplication();
    } catch (error) {
      console.error("Error in componentDidMount:", error);
      this.handleError("Erreur lors de l'initialisation de l'application");
    }
  }

  /**
   * Initialise l'application en chargeant toutes les données nécessaires
   * Utilise Promise.all pour optimiser les appels parallèles
   */
  private async initializeApplication(): Promise<void> {
    // Chargement des comptes
    const accounts: string[] = await this.walletService.getAccounts();
    console.log("Account retrieved:", accounts);

    // Chargement parallèle des données
    const [balances, contractInfo, particles] = await Promise.all([
      this.walletService.getMultipleBalances(accounts),
      this.lotteryService.getContractInfo(),
      Promise.resolve(this.particleService.generateParticles())
    ]);

    console.log("Contract info:", contractInfo);

    // Mise à jour de l'état en une seule fois
    this.setState({
      accounts,
      balanceInEther: balances,
      owner: contractInfo.owner,
      players: contractInfo.participants,
      jackpot: contractInfo.jackpot,
      particles
    });
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
    // Validation en temps réel du format numérique
    if (betAmount === '' || /^\d*\.?\d*$/.test(betAmount)) {
      this.setState({ betAmount });
    }
  };

  /**
   * Valide les données du formulaire avant soumission
   */
  private validateForm(): boolean {
    const { name, selectedAccount, betAmount, accounts, balanceInEther } = this.state;

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
   * Gère la soumission du formulaire de participation
   * Orchestration complète du processus d'inscription
   */
  private handleParticipationSubmit = async (): Promise<void> => {
    if (!this.validateForm()) {
      return;
    }

    this.setState({ isLoading: true, succesMsg: "" });

    try {
      await this.enrollParticipant();
      await this.refreshApplicationData();
      this.handleSuccessfulEnrollment();
    } catch (error) {
      console.error('Error calling enroleInLottery function:', error);
      this.handleEnrollmentError();
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

    // Passer le montant de la mise au service
    await this.lotteryService.enrollParticipant(
      this.state.name, 
      selectedAccount, 
      this.state.betAmount
    );
  }

  /**
   * Rafraîchit les données après une transaction réussie
   * Optimisé avec Promise.all pour les appels parallèles
   */
  private async refreshApplicationData(): Promise<void> {
    const [contractInfo, balances] = await Promise.all([
      this.lotteryService.getContractInfo(),
      this.walletService.getMultipleBalances(this.state.accounts)
    ]);

    this.setState({
      players: parseInt(contractInfo.participants),
      jackpot: contractInfo.jackpot,
      balanceInEther: balances
    });
  }

  /**
   * Gère le succès de l'inscription
   * Réinitialise le formulaire et affiche le message de succès
   */
  private handleSuccessfulEnrollment(): void {
    this.setState({ 
      name: "",
      selectedAccount: "",
      betAmount: "1", // Réinitialiser à la mise minimum
      isLoading: false
    });

    this.showMessage(`🎉 Merci! Mise de ${this.state.betAmount} ETH effectuée! Bonne chance!`, 5000);
    
    // Log pour debugging
    console.log("Transaction successful - Players:", this.state.players);
    console.log("Transaction successful - Jackpot:", this.state.jackpot);
    console.log("Transaction successful - Bet Amount:", this.state.betAmount);
  }

  /**
   * Gère les erreurs d'inscription
   */
  private handleEnrollmentError(): void {
    this.setState({ isLoading: false });
    this.showMessage("❌ Erreur lors de la transaction. Veuillez réessayer.", 5000);
  }

  /**
   * Affiche un message temporaire avec auto-masquage
   */
  private showMessage(message: string, duration: number): void {
    this.setState({ succesMsg: message });
    
    setTimeout(() => {
      this.setState({ succesMsg: "" });
    }, duration);
  }

  /**
   * Gère les erreurs générales de l'application
   */
  private handleError(message: string): void {
    console.error(message);
    this.showMessage(`❌ ${message}`, 5000);
  }

  /**
   * Rendu du composant principal
   * Orchestration de tous les composants UI
   */
  render(): JSX.Element {
    return (
      <div className="app">
        {/* Animations d'arrière-plan */}
        <div className="background-animation"></div>
        <FloatingParticles particles={this.state.particles} />

        <div className="container">
          {/* En-tête de l'application */}
          <Header />

          {/* Statistiques principales */}
          <StatsGrid 
            participants={this.state.players}
            jackpot={this.state.jackpot}
          />

          {/* Contenu principal en deux colonnes */}
          <div className="main-content">
            <BalanceList 
              balances={this.state.balanceInEther}
              isLoading={this.state.balanceInEther.length === 0}
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

          {/* Affichage de l'adresse du portefeuille actif */}
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