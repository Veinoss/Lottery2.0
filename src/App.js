import React, {Component} from "react";
import './App.css'
import web3 from './web3';
import lottery from './Lottery.json'

class App extends Component {

    constructor(props){
      super(props)
      this.state = {
        account:"0x0",
        balance: "0",
        owner:"",
        players: [],
        value:""
      }
    }

    async componentDidMount() {
    
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      const contractAddress = '0xE76591BA999309526D4070ebc1e177Ba8F5f92cC';
      const contractInstance = new web3.eth.Contract(lottery.abi, contractAddress);
      console.log(contractInstance)

      const owner = await contractInstance.methods.owner().call();
      const players = await contractInstance.methods.getNumberOfParticipants().call();
  
      this.setState({
        account: accounts[0],
        balance: web3.utils.fromWei(balance, 'ether'),
        owner: owner,
        players: players
      });
    }
  
    handleChange = (event) => {
      this.setState({ [event.target.name]: event.target.value });
    };
  
    handleSubmit = async (event) => {
      event.preventDefault();

      const web3 = window.web3;
      const contractAddress = '0xE76591BA999309526D4070ebc1e177Ba8F5f92cC';
      const contractInstance = new web3.eth.Contract(lottery.abi, contractAddress);
      const numberP = await contractInstance.methods.getNumberOfParticipants().call();
      console.log(numberP)

      try {
        await contractInstance.methods.enroleInLottery(this.state.name).send({ 
          from: this.state.account, 
          value: web3.utils.toWei("1", 'ether'),
          gas: 3000000, // Set a reasonable gas limit explicitly
          gasPrice: web3.utils.toWei('20', 'gwei'), // Use a fixed legacy gas price
        });
        console.log('Transaction successful');
        this.setState({ 
          name: "",
          succesMsg: "Merci! Transaction est un succès 🎉!",
        });
      } catch (error) {
        console.error('Error calling enroleInLottery function:', error);
      }
    };

    render() {
      return (
        <div className='text-center' style={{ color: "" }}>
          <h1> Hello! ✌️ Lottery!</h1>
          <h2>Présentement, le nombre de participants est de : {this.state.players}</h2>
          <br></br>
          <br></br>
          <p>Ton adresse de portefeuille : {this.state.account}</p>
          <p>Ta balance : {this.state.balance}</p>
          <br></br>
          <br></br>
          <p>Si tu veux participer, entre ton nom et tu seras automatiquement ajouté! Mise est de 1 ether!</p>
          <form onSubmit={this.handleSubmit}>
            <label>
              Nom du participant:
              <input
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
              />
            </label>
            <button type="submit">Participer</button>
            <br></br>
            {this.state.succesMsg}
          </form>
        </div>
      )
    }
  }
  
  export default App;