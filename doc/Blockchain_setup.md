# 🔗 Guide Complet : Créer un Projet Blockchain de A à Z

## 📋 Vue d'ensemble

Ce guide explique comment créer un projet de loterie blockchain complet depuis zéro, en utilisant Truffle, Ganache, Solidity et React/TypeScript.

## 🎯 Objectifs du Guide

À la fin de ce guide, vous saurez :
- ✅ Comprendre les rôles de Truffle, Ganache et Solidity
- ✅ Créer un smart contract de loterie
- ✅ Compiler et déployer le contrat
- ✅ Générer l'ABI (Lottery.json)
- ✅ Intégrer avec une application React/TypeScript
- ✅ Tester et déboguer votre DApp

---

## 🧠 Concepts Fondamentaux

### **Qu'est-ce que Truffle ?**
```
Truffle = Framework de développement Ethereum
├── Compilation des smart contracts Solidity
├── Déploiement automatisé sur différents réseaux
├── Testing framework intégré
├── Migration et versioning des contrats
└── Console interactive pour déboguer
```

**Analogie** : Truffle est comme **Create React App** mais pour la blockchain.

### **Qu'est-ce que Ganache ?**
```
Ganache = Blockchain Ethereum locale pour développement
├── 10 comptes préconfigurés avec ETH fictif
├── Mining instantané (pas d'attente)
├── Interface graphique pour voir les transactions
├── Reset facile pour recommencer
└── Aucun coût réel (ETH fictif)
```

**Analogie** : Ganache est comme **localhost:3000** mais pour la blockchain.

### **Qu'est-ce qu'un Smart Contract ?**
```
Smart Contract = Programme stocké sur la blockchain
├── Code immuable une fois déployé
├── Exécution automatique selon les règles
├── Pas d'intermédiaire nécessaire
├── Transparence totale (code public)
└── Coût d'exécution (gas fees)
```

**Analogie** : Un smart contract est comme un **distributeur automatique** : vous mettez de l'argent, suivez les règles, et obtenez automatiquement le résultat.

### **Qu'est-ce que l'ABI (Application Binary Interface) ?**
```
ABI = Manuel d'instructions pour communiquer avec le contrat
├── Décrit toutes les fonctions disponibles
├── Types de paramètres d'entrée/sortie
├── Événements émis par le contrat
├── Généré automatiquement par Truffle
└── Utilisé par React pour appeler le contrat
```

**Le fichier Lottery.json de 15 000 lignes contient :**
- L'ABI (interface)
- Le bytecode compilé
- Les métadonnées de déploiement
- Les informations de réseau

---

## 🚀 Étape 1 : Installation et Setup Initial

### **1.1 Prérequis**
```bash
# Installer Node.js (version 16+)
node --version
npm --version

# Installer Truffle globalement
npm install -g truffle

# Installer Ganache CLI
npm install -g ganache-cli

# Ou télécharger Ganache GUI : https://www.trufflesuite.com/ganache
```

### **1.2 Créer la Structure du Projet**
```bash
# Créer le dossier projet
mkdir crypto-lottery
cd crypto-lottery

# Initialiser Truffle
truffle init

# La structure créée :
crypto-lottery/
├── contracts/          # Smart contracts Solidity
│   └── Migrations.sol  # Contrat système Truffle
├── migrations/         # Scripts de déploiement
│   └── 1_initial_migration.js
├── test/              # Tests des contrats
├── build/             # Contrats compilés (généré)
└── truffle-config.js  # Configuration Truffle
```

### **1.3 Initialiser le Frontend React**
```bash
# Dans le même dossier
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install web3

# Structure finale :
crypto-lottery/
├── contracts/         # Smart contracts
├── migrations/        # Déploiement blockchain
├── test/             # Tests contrats
├── frontend/         # Application React/TS
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── truffle-config.js
└── package.json      # Dépendances globales
```

---

## 🔨 Étape 2 : Créer le Smart Contract

### **2.1 Créer le Fichier Lottery.sol**
```bash
# Créer le contrat principal
touch contracts/Lottery.sol
```

### **2.2 Écrire le Code Solidity**
```solidity
// contracts/Lottery.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract Lottery {
    // Variables d'état
    address public owner;
    uint256 private jackPotOdds = 10;
    uint256 private prizePool;
    uint256 private jackPot;
    
    // Mappings et arrays
    mapping(address => string) player;
    address[] public players;

    // Événements (logs)
    event NewPlayerEnrolled(string message);    
    event DisplayWinner(string message);
    event JackPotWinner(string message);

    // Constructeur (appelé au déploiement)
    constructor(){   
        owner = msg.sender; // Celui qui déploie devient owner
    }

    // Modificateur (sécurité)
    modifier onlyOwner() {
        require(msg.sender == owner, "Fonction réservée au owner");
        _;
    }
    
    // Fonction pour changer les chances de jackpot
    function setJackPotOdds(uint256 newOdds) public onlyOwner {   
        require(newOdds >= 0 && newOdds <= 100);     
        jackPotOdds = newOdds;
    }
    
    // Fonctions de lecture (gratuites)
    function getJackPot() public view returns (uint) {
        return jackPot;
    }

    function getPrizePool() public view returns (uint) {
        return prizePool;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getNumberOfParticipants() public view returns(uint){
        return players.length;
    }

    // Fonction principale : s'inscrire à la loterie
    function enroleInLottery(string memory playerName) public payable {
        // Validations
        require(msg.value >= 1 ether, "Mise minimum de 1 ETH");
        require(bytes(playerName).length > 0, "Nom requis");
        require(players.length < 10, "Maximum 10 participants");
        
        // Enregistrer le joueur
        player[msg.sender] = playerName;
        players.push(msg.sender);

        // Répartir l'argent
        prizePool += (msg.value * 90) / 100;  // 90% au prize pool
        jackPot += (msg.value * 9) / 100;     // 9% au jackpot
        // 1% reste dans le contrat

        // Émettre un événement
        emit NewPlayerEnrolled(
            string(abi.encodePacked(playerName, " s'est inscrit! Bonne chance!"))
        );

        // Si 10 joueurs, on tire au sort
        if(players.length == 10){
            getAWinner();
        }
    }

    // Fonction privée : tirer au sort le gagnant
    function getAWinner() private {                
        // Générer un nombre pseudo-aléatoire
        uint randomHash = uint(keccak256(
            abi.encodePacked(block.difficulty, block.timestamp)
        ));
        uint winnerIndex = randomHash % players.length;
    
        address winner = players[winnerIndex];   
        sendPrize(winner);        
        emit DisplayWinner(player[winner]);
        resetState();
    }    

    // Vérifier si le jackpot est gagné
    function isJackPotWon() private view returns (bool){
        uint randomHash = uint(keccak256(
            abi.encodePacked(block.difficulty, block.timestamp)
        ));
        return (randomHash % 100) <= jackPotOdds;
    }

    // Envoyer le prix au gagnant
    function sendPrize(address winner) private {
        if(isJackPotWon()) {
            prizePool += jackPot;
            jackPot = 0;
            emit JackPotWinner(
                string(abi.encodePacked("JACKPOT gagné par: ", player[winner]))
            );
        }
       
        payable(winner).transfer(prizePool);
    }

    // Réinitialiser pour un nouveau round
    function resetState() private {
        prizePool = 0;
        delete players;
    }
}
```

### **2.3 Comprendre le Code**

**Structure du contrat :**
```solidity
contract Lottery {
    // 1. Variables d'état (stockées sur blockchain)
    address public owner;          // Propriétaire du contrat
    uint256 private prizePool;     // Cagnotte principale
    mapping(address => string) player; // Nom des joueurs
    
    // 2. Événements (logs pour le frontend)
    event NewPlayerEnrolled(string message);
    
    // 3. Fonctions publiques (appelables de l'extérieur)
    function enroleInLottery(string memory name) public payable {
        // Logique métier
    }
    
    // 4. Fonctions privées (usage interne)
    function getAWinner() private {
        // Logique de tirage
    }
}
```

**Mots-clés importants :**
- `public` : Fonction accessible depuis l'extérieur
- `private` : Fonction interne au contrat
- `payable` : Fonction qui peut recevoir de l'ETH
- `view` : Fonction qui lit sans modifier (gratuite)
- `require()` : Validation qui interrompt si fausse
- `msg.sender` : Adresse de celui qui appelle
- `msg.value` : Montant ETH envoyé

---

## ⚙️ Étape 3 : Configuration et Compilation

### **3.1 Configurer Truffle**
```javascript
// truffle-config.js
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Ganache local
      port: 8545,            // Port par défaut
      network_id: "*",       // Tous les réseaux
    },
    
    // Configuration future pour testnet
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  compilers: {
    solc: {
      version: "0.8.19",    // Version Solidity
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
```

### **3.2 Démarrer Ganache**
```bash
# Option 1: Ganache CLI
ganache-cli --accounts 10 --defaultBalanceEther 1000 --host 0.0.0.0

# Option 2: Ganache GUI
# Télécharger et installer depuis le site officiel
# Démarrer avec les paramètres par défaut
```

**Résultat Ganache :**
```
Available Accounts
==================
(0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 (1000 ETH)
(1) 0xf17f52151EbEF6C7334FAD080c5704D77216b732 (1000 ETH)
...

Private Keys
==================
(0) 0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
(1) 0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f
...

RPC Server: http://127.0.0.1:8545
```

### **3.3 Compiler le Contrat**
```bash
# Compiler tous les contrats
truffle compile

# Résultat :
Compiling your contracts...
===========================
> Compiling ./contracts/Lottery.sol
> Compiling ./contracts/Migrations.sol

> Artifacts written to ./build/contracts
> Compiled successfully using:
   - solc: 0.8.19+commit.7dd6d404.Emscripten.clang
```

**Ce qui se passe :**
1. Truffle lit `contracts/Lottery.sol`
2. Utilise le compilateur Solidity
3. Génère `build/contracts/Lottery.json` (15 000 lignes !)
4. Ce fichier contient l'ABI + bytecode + métadonnées

### **3.4 Analyser le Lottery.json Généré**
```json
{
  "contractName": "Lottery",
  "abi": [
    {
      "inputs": [],
      "name": "getJackPot",
      "outputs": [{"type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "playerName", "type": "string"}],
      "name": "enroleInLottery",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
    // ... des centaines d'autres entrées
  ],
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "deployedBytecode": "0x608060405234801561001057600080fd5b50...",
  "networks": {
    "5777": {
      "events": {},
      "links": {},
      "address": "0x8070Ade22C78246abF7e0EC8655C1f9A705E0bD8",
      "transactionHash": "0x..."
    }
  }
}
```

**Sections importantes :**
- `abi` : Interface pour appeler les fonctions
- `bytecode` : Code machine à déployer
- `networks` : Adresses de déploiement par réseau

---

## 🚀 Étape 4 : Déploiement du Contrat

### **4.1 Créer le Script de Migration**
```javascript
// migrations/2_deploy_lottery.js
const Lottery = artifacts.require("Lottery");

module.exports = function (deployer) {
  // Déployer le contrat Lottery
  deployer.deploy(Lottery);
};
```

### **4.2 Déployer sur Ganache**
```bash
# S'assurer que Ganache tourne sur localhost:8545
truffle migrate --network development

# Résultat :
Starting migrations...
======================
> Network name:    'development'
> Network id:      5777
> Block gas limit: 6721975 (0x6691b7)

1_initial_migration.js
======================
   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x...
   > contract address:    0x...
   > gas used:            164983 (0x28457)
   ✓ Successfully deployed Migrations

2_deploy_lottery.js
=================
   Deploying 'Lottery'
   -------------------
   > transaction hash:    0x...
   > contract address:    0x8070Ade22C78246abF7e0EC8655C1f9A705E0bD8
   > gas used:            1234567 (0x...)
   ✓ Successfully deployed Lottery

> Saving artifacts...
```

**Ce qui se passe :**
1. Truffle se connecte à Ganache
2. Utilise le premier compte pour payer le déploiement
3. Envoie le bytecode sur la blockchain
4. Reçoit une adresse de contrat
5. Met à jour `Lottery.json` avec l'adresse

### **4.3 Vérifier le Déploiement**
```bash
# Console interactive Truffle
truffle console --network development

# Dans la console :
truffle(development)> let lottery = await Lottery.deployed()
truffle(development)> lottery.address
'0x8070Ade22C78246abF7e0EC8655C1f9A705E0bD8'

truffle(development)> let owner = await lottery.owner()
truffle(development)> owner
'0x627306090abaB3A6e1400e9345bC60c78a8BEf57'

truffle(development)> let jackpot = await lottery.getJackPot()
truffle(development)> jackpot.toString()
'0'
```

---

## 🔧 Étape 5 : Tests du Smart Contract

### **5.1 Créer les Tests**
```javascript
// test/lottery.test.js
const Lottery = artifacts.require("Lottery");

contract("Lottery", (accounts) => {
  let lottery;
  const owner = accounts[0];
  const player1 = accounts[1];
  const player2 = accounts[2];

  beforeEach(async () => {
    lottery = await Lottery.new();
  });

  describe("Déploiement", () => {
    it("devrait définir le bon propriétaire", async () => {
      const contractOwner = await lottery.owner();
      assert.equal(contractOwner, owner, "Le propriétaire n'est pas correct");
    });

    it("devrait initialiser le jackpot à 0", async () => {
      const jackpot = await lottery.getJackPot();
      assert.equal(jackpot.toString(), "0", "Le jackpot devrait être 0");
    });
  });

  describe("Inscription à la loterie", () => {
    it("devrait permettre l'inscription avec 1 ETH", async () => {
      await lottery.enroleInLottery("Alice", {
        from: player1,
        value: web3.utils.toWei("1", "ether")
      });

      const participants = await lottery.getNumberOfParticipants();
      assert.equal(participants.toString(), "1", "Devrait avoir 1 participant");
    });

    it("devrait rejeter une mise inférieure à 1 ETH", async () => {
      try {
        await lottery.enroleInLottery("Bob", {
          from: player2,
          value: web3.utils.toWei("0.5", "ether")
        });
        assert.fail("Devrait rejeter une mise < 1 ETH");
      } catch (error) {
        assert(error.message.includes("Mise minimum"), "Mauvais message d'erreur");
      }
    });
  });
});
```

### **5.2 Exécuter les Tests**
```bash
# Lancer tous les tests
truffle test

# Résultat :
Contract: Lottery
  Déploiement
    ✓ devrait définir le bon propriétaire (45ms)
    ✓ devrait initialiser le jackpot à 0 (38ms)
  Inscription à la loterie
    ✓ devrait permettre l'inscription avec 1 ETH (67ms)
    ✓ devrait rejeter une mise inférieure à 1 ETH (54ms)

4 passing (1s)
```

---

## ⚛️ Étape 6 : Intégration React/TypeScript

### **6.1 Copier l'ABI dans le Frontend**
```bash
# Copier le fichier généré
cp build/contracts/Lottery.json frontend/src/
```

### **6.2 Créer le Service Web3**
```typescript
// frontend/src/web3.ts
import Web3 from 'web3';

declare global {
  interface Window {
    ethereum?: any;
  }
}

let web3: Web3;

async function initWeb3(): Promise<Web3> {
  // Vérifier MetaMask
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } 
  // Fallback vers Ganache
  else {
    web3 = new Web3('http://localhost:8545');
  }
  
  return web3;
}

export async function getWeb3(): Promise<Web3> {
  if (!web3) {
    web3 = await initWeb3();
  }
  return web3;
}
```

### **6.3 Créer le Service Lottery**
```typescript
// frontend/src/LotteryService.ts
import { getWeb3 } from './web3';
import LotteryArtifact from './Lottery.json';

class LotteryService {
  private contract: any;
  private web3: Web3;

  async init() {
    this.web3 = await getWeb3();
    const networkId = await this.web3.eth.net.getId();
    const deployedNetwork = LotteryArtifact.networks[networkId.toString()];
    
    this.contract = new this.web3.eth.Contract(
      LotteryArtifact.abi,
      deployedNetwork.address
    );
  }

  async getJackpot(): Promise<string> {
    const jackpotWei = await this.contract.methods.getJackPot().call();
    return this.web3.utils.fromWei(jackpotWei, 'ether');
  }

  async getParticipants(): Promise<string> {
    return await this.contract.methods.getNumberOfParticipants().call();
  }

  async enrollPlayer(name: string, account: string, betAmount: string): Promise<void> {
    const betWei = this.web3.utils.toWei(betAmount, 'ether');
    
    await this.contract.methods.enroleInLottery(name).send({
      from: account,
      value: betWei,
      gas: 3000000
    });
  }
}

export default LotteryService;
```

### **6.4 Utiliser dans le Composant React**
```typescript
// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { getWeb3 } from './web3';
import LotteryService from './LotteryService';

function App() {
  const [lotteryService] = useState(new LotteryService());
  const [accounts, setAccounts] = useState<string[]>([]);
  const [jackpot, setJackpot] = useState('0');
  const [participants, setParticipants] = useState('0');

  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    try {
      await lotteryService.init();
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      
      setAccounts(accounts);
      await loadContractData();
    } catch (error) {
      console.error('Erreur initialisation:', error);
    }
  }

  async function loadContractData() {
    const jackpot = await lotteryService.getJackpot();
    const participants = await lotteryService.getParticipants();
    
    setJackpot(jackpot);
    setParticipants(participants);
  }

  async function handleEnroll() {
    try {
      await lotteryService.enrollPlayer('Alice', accounts[0], '1');
      await loadContractData(); // Recharger les données
    } catch (error) {
      console.error('Erreur inscription:', error);
    }
  }

  return (
    <div>
      <h1>🎰 Crypto Lottery</h1>
      <div>
        <p>Jackpot: {jackpot} ETH</p>
        <p>Participants: {participants}/10</p>
      </div>
      
      {accounts.length > 0 && (
        <div>
          <button onClick={handleEnroll}>
            S'inscrire (1 ETH)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
```

---

## 🔄 Étape 7 : Workflow de Développement

### **7.1 Développement Itératif**
```bash
# 1. Modifier le contrat Solidity
vim contracts/Lottery.sol

# 2. Recompiler
truffle compile

# 3. Redéployer (reset pour éviter les conflits)
truffle migrate --reset

# 4. Mettre à jour le frontend avec la nouvelle adresse
cp build/contracts/Lottery.json frontend/src/

# 5. Relancer l'app React
cd frontend && npm run dev
```

### **7.2 Debugging avec Truffle Console**
```bash
truffle console

# Interactions de debug :
truffle(development)> let lottery = await Lottery.deployed()
truffle(development)> let accounts = await web3.eth.getAccounts()

# Simuler une inscription
truffle(development)> await lottery.enroleInLottery("TestPlayer", {
  from: accounts[1], 
  value: web3.utils.toWei("1", "ether")
})

# Vérifier l'état
truffle(development)> let participants = await lottery.getNumberOfParticipants()
truffle(development)> participants.toString()
```

### **7.3 Événements et Logs**
```javascript
// Écouter les événements dans React
useEffect(() => {
  if (lotteryService.contract) {
    lotteryService.contract.events.NewPlayerEnrolled({
      fromBlock: 'latest'
    })
    .on('data', (event) => {
      console.log('Nouveau joueur:', event.returnValues.message);
      loadContractData(); // Recharger les données
    })
    .on('error', console.error);
  }
}, [lotteryService]);
```

---

## 🐛 Troubleshooting Courant

### **Problème : "Contract not deployed"**
```bash
# Solution 1: Vérifier que Ganache tourne
curl http://localhost:8545

# Solution 2: Redéployer
truffle migrate --reset

# Solution 3: Vérifier la configuration réseau
truffle networks
```

### **Problème : "Gas estimation failed"**
```javascript
// Solution : Spécifier le gas manuellement
await contract.methods.enroleInLottery("Player").send({
  from: account,
  value: web3.utils.toWei("1", "ether"),
  gas: 3000000,        // ← Ajouter ceci
  gasPrice: '20000000000'  // 20 Gwei
});
```

### **Problème : "Address undefined"**
```typescript
// Solution : Vérifier le network ID
const networkId = await web3.eth.net.getId();
console.log('Network ID:', networkId);

const deployedNetwork = LotteryArtifact.networks[networkId.toString()];
if (!deployedNetwork) {
  throw new Error(`Contrat non déployé sur le réseau ${networkId}`);
}
```

---

## 📚 Ressources et Références

### **Documentation Officielle**
- [Truffle Documentation](https://trufflesuite.com/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ganache Documentation](https://trufflesuite.com/ganache/)

### **Outils Utiles**
- [Remix IDE](https://remix.ethereum.org/) - IDE Solidity en ligne
- [Etherscan](https://etherscan.io/) - Explorateur blockchain
- [OpenZeppelin](https://openzeppelin.com/contracts/) - Contrats sécurisés
- [Hardhat](https://hardhat.org/) - Alternative à Truffle

### **Commandes de Référence**
```bash
# Truffle
truffle init           # Initialiser projet
truffle compile        # Compiler contrats
truffle migrate        # Déployer contrats
truffle test          # Lancer tests
truffle console       # Console interactive

# Ganache
ganache-cli           # Démarrer blockchain locale
ganache-cli --help    # Voir toutes les options

# Web3
npm install web3      # Installer Web3.js
```

---

## 🎯 Prochaines Étapes

Une fois ce guide maîtrisé, vous pouvez :

1. **Sécuriser le contrat** avec OpenZeppelin
2. **Déployer sur testnet** (Sepolia, Goerli)
3. **Ajouter des tests avancés** avec coverage
4. **Optimiser le gas** avec des patterns efficaces
5. **Créer une interface avancée** avec votre architecture TypeScript
6. **Intégrer Chainlink VRF** pour la randomness sécurisée
7. **Déployer en production** sur Ethereum mainnet

**Félicitations ! Vous maîtrisez maintenant le développement blockchain complet !** 🚀