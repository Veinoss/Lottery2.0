import { Component, ChangeEvent, FormEvent } from "react";
import './assets/App.css';
import web3 from './web3';
import lottery from './Lottery.json';
import AppPropsInterface from "./types/interfaces/AppPropsInterface";
import AppState from './types/AppState';
import Particule from './types/Particule';
import LotteryContractInterface from './types/interfaces/LotteryContractInterface';

class App extends Component<AppPropsInterface, AppState> {
  constructor(props: AppPropsInterface) {
    super(props);
    this.state = {
      accounts: [],       
      balanceInEther: [],
      owner: "",
      players: "",
      value: "",
      selectedAccount: "",
      jackpot: "",
      name: "",
      succesMsg: "",
      isLoading: false,
      particles: []
    };
  }

  async componentDidMount(): Promise<void> {      
    try {
      const accounts: string[] = await web3.eth.getAccounts();
      console.log("Account retrieved:" + accounts);

      const balances: string[] = await this.updateBalances(accounts);

      const contractAddress: string | undefined = import.meta.env.VITE_LOTTERY_ADDRESS;
      console.log("Contract Address: ", contractAddress);

      if (!contractAddress) {
        console.error("Contract address not found in environment variables");
        return;
      }
    
      const contractInstance: LotteryContractInterface = new web3.eth.Contract(
        lottery.abi, 
        contractAddress
      ) as LotteryContractInterface;            
      console.log("contractInstance: ", contractInstance);

      const nbOfPlayers: string = await contractInstance.methods.getNumberOfParticipants().call();
      console.log("Number of players: ", nbOfPlayers);

      const owner: string = await contractInstance.methods.owner().call();
      console.log("Owner: ", owner);

      // Get initial jackpot
      const initialJackpot: string = web3.utils.fromWei(
        await contractInstance.methods.getJackPot().call(), 
        'ether'
      );

      this.setState({
        accounts: accounts,        
        balanceInEther: balances,
        owner: owner,
        players: nbOfPlayers,
        jackpot: initialJackpot
      });

      // Initialize particles
      this.createParticles();
    } catch (error) {
      console.error("Error in componentDidMount:", error);
    }
  }

  createParticles = (): void => {
    const particles: Particule[] = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: Math.random() * 6 + 4
      });
    }
    this.setState({ particles });
  }

  handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    this.setState({ [name]: value } as Pick<AppState, keyof AppState>);
  };

  handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    if (!this.state.name || this.state.selectedAccount === '') {
      this.setState({ succesMsg: "⚠️ Veuillez remplir tous les champs!" });
      setTimeout(() => {
        this.setState({ succesMsg: "" });
      }, 3000);
      return;
    }

    this.setState({ isLoading: true, succesMsg: "" });

    console.log("Entering handleSubmit...");      
    const contractAddress: string | undefined = import.meta.env.VITE_LOTTERY_ADDRESS;
    
    if (!contractAddress) {
      console.error("Contract address not found");
      this.setState({ 
        succesMsg: "❌ Erreur de configuration du contrat.",
        isLoading: false 
      });
      return;
    }

    const contractInstance: LotteryContractInterface = new web3.eth.Contract(
      lottery.abi, 
      contractAddress
    ) as LotteryContractInterface;
    
    const numberP: string = await contractInstance.methods.getNumberOfParticipants().call();
    console.log("In handleSubmit- number of players: ", numberP);

    const accounts: string[] = await web3.eth.getAccounts();
    const selectedAccountIndex: number = typeof this.state.selectedAccount === 'string' 
      ? parseInt(this.state.selectedAccount) 
      : this.state.selectedAccount;

    try {
      await contractInstance.methods.enroleInLottery(this.state.name).send({ 
        from: accounts[selectedAccountIndex],
        value: web3.utils.toWei("1", 'ether'),
        gas: 3000000,
        gasPrice: web3.utils.toWei('20', 'gwei'),
      });

      // Fetching updated contract state
      const players: number = parseInt(
        await contractInstance.methods.getNumberOfParticipants().call()
      );
      const newJackpotSize: string = web3.utils.fromWei(
        await contractInstance.methods.getJackPot().call(), 
        'ether'
      );
      console.log("Jackpot size = : ", newJackpotSize);

      console.log('Transaction successful');
      this.setState({ 
        players: players,
        balanceInEther: await this.updateBalances(this.state.accounts),
        name: "",
        selectedAccount: "",
        succesMsg: "🎉 Merci! Transaction réussie! Bonne chance!",
        jackpot: newJackpotSize,
        isLoading: false
      });

      console.log("nbOfPlayers from setState = : ", this.state.players);
      console.log("Jackpot size from setState = : ", this.state.jackpot);

      // Auto-hide success message
      setTimeout(() => {
        this.setState({ succesMsg: "" });
      }, 5000);

    } catch (error) {
      console.error('Error calling enroleInLottery function:', error);
      this.setState({ 
        succesMsg: "❌ Erreur lors de la transaction. Veuillez réessayer.",
        isLoading: false 
      });
      
      // Auto-hide error message
      setTimeout(() => {
        this.setState({ succesMsg: "" });
      }, 5000);
    }
  };

  async updateBalances(accounts: string[]): Promise<string[]> {
    const balances: string[] = [];     
    for (let i = 0; i < 10; i++) {
      const wei: string = await web3.eth.getBalance(accounts[i]);
      balances.push(web3.utils.fromWei(wei, "ether"));
    }
    return balances;
  }

  render(): JSX.Element {
    return (
      <div className="app">
        <div className="background-animation"></div>
        
        <div className="floating-particles">
          {this.state.particles.map((particle: Particule) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            ></div>
          ))}
        </div>

        <div className="container">
          <header className="header">
            <h1 className="title">🎰 Crypto Lottery</h1>
            <p className="subtitle">Participez à la loterie décentralisée la plus excitante du Web3!</p>
          </header>

          <div className="stats-grid">
            <div className="stat-card glow-effect">
              <span className="stat-icon">👥</span>
              <div className="stat-value">{this.state.players || 0}</div>
              <div className="stat-label">Participants</div>
            </div>
            
            <div className="stat-card glow-effect">
              <span className="stat-icon">💰</span>
              <div className="stat-value">{this.state.jackpot || 0} ETH</div>
              <div className="stat-label">Jackpot</div>
            </div>
          </div>

          <div className="main-content">
            <div className="panel">
              <h3>💼 Portefeuilles Disponibles</h3>
              <div className="balance-list">
                {this.state.balanceInEther.length > 0 ? (
                  this.state.balanceInEther.map((bal: string, index: number) => (
                    <div key={index} className="balance-item">
                      <span className="account-number">Compte {index + 1}</span>
                      <span className="balance-amount">{parseFloat(bal).toFixed(4)} ETH</span>
                    </div>
                  ))
                ) : (
                  <div className="balance-item">
                    <span className="account-number">Chargement...</span>
                    <span className="balance-amount">-- ETH</span>
                  </div>
                )}
              </div>
            </div>

            <div className="panel">
              <h3>🎫 Participer à la Loterie</h3>
              <form className="participation-form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Choisir un compte (0-9)</label>
                  <select 
                    className="form-input"
                    name="selectedAccount"
                    value={this.state.selectedAccount}
                    onChange={this.handleChange}
                  >
                    <option value="">Sélectionnez votre compte...</option>
                    {[...Array(10)].map((_: unknown, i: number) => (
                      <option key={i} value={i}>
                        Compte {i + 1} - {this.state.balanceInEther[i] ? parseFloat(this.state.balanceInEther[i]).toFixed(4) : '...'} ETH
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nom du participant</label>
                  <input 
                    type="text" 
                    className="form-input"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                    placeholder="Entrez votre nom..."
                  />
                </div>
                
                <div className="info-box">
                  <strong>💡 Mise requise: 1 ETH</strong>
                </div>
                
                <button 
                  type="submit" 
                  className={`participate-btn ${this.state.isLoading ? 'loading' : ''}`}
                  disabled={this.state.isLoading}
                >
                  {this.state.isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Transaction en cours...
                    </>
                  ) : (
                    '🚀 Participer Maintenant!'
                  )}
                </button>
                
                {this.state.succesMsg && (
                  <div className={`message ${this.state.succesMsg.includes('❌') ? 'error' : 'success'}`}>
                    {this.state.succesMsg}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="panel">
            <h3>🔐 Votre Adresse de Portefeuille Active</h3>
            <div className="wallet-address">
              {this.state.accounts[
                typeof this.state.selectedAccount === 'string' 
                  ? parseInt(this.state.selectedAccount) 
                  : this.state.selectedAccount
              ] || "Aucun compte sélectionné"}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;