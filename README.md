# 🎰 Crypto Lottery - Application de Loterie Décentralisée

Une application de loterie basée sur la blockchain Ethereum, construite avec React, TypeScript, Solidity et Web3.

## 📋 Description

Cette application permet aux utilisateurs de :
- 🎲 Participer à une loterie décentralisée avec des ETH
- 💰 Gagner le jackpot collectif (90% des mises + bonus jackpot potentiel de 9%)
- 🏆 Système de jackpot bonus avec 10% de chances de gain
- 👛 Connexion sécurisée via MetaMask ou développement local avec Ganache
- 🌐 Support multi-réseaux (Ganache, Sepolia, Mainnet)

## 🏗️ Architecture Technique

- **Frontend** : React 18 + TypeScript + Vite
- **Blockchain** : Ethereum + Smart Contract Solidity 0.8.19
- **Web3** : Web3.js 4.15.0 avec support MetaMask/Ganache
- **Développement** : Truffle Suite + Docker
- **Style** : CSS moderne avec animations

## ⚡ Démarrage Rapide

### Avec Docker (Recommandé pour débuter)

```bash
# Cloner le projet
git clone <repository-url>
cd lottery

# Démarrer l'environnement de développement
docker-compose up

# Dans un autre terminal - Exécuter les tests
docker-compose exec truffle truffle test
```

### Installation Manuelle

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler les contrats
truffle compile

# 3. Démarrer Ganache (dans un terminal séparé)
ganache-cli

# 4. Déployer les contrats sur Ganache
truffle migrate --network development

# 5. Démarrer l'application React
npm run dev
```

## 🔧 Configuration des Environnements

### 📁 Variables d'Environnement

Créez un fichier `.env` à la racine :

```bash
# Adresse du contrat déployé
VITE_LOTTERY_ADDRESS=0x8070Ade22C78246abF7e0EC8655C1f9A705E0bD8

# Optionnel - Configuration avancée  
VITE_GANACHE_URL=http://127.0.0.1:8545
VITE_NETWORK_ID=1337
VITE_DEBUG_MODE=true
```

### 🏠 Développement Local (Ganache)

```bash
# 1. Démarrer Ganache
ganache-cli -p 8545 -h 0.0.0.0

# 2. Déployer les contrats
truffle migrate --network development

# 3. Copier l'adresse du contrat dans .env
# 4. Démarrer l'app
npm run dev
```

**Configuration automatique** : L'app se connecte automatiquement à Ganache si disponible.

### 🧪 Test sur Sepolia Testnet

```bash
# 1. Configurer truffle-config.js pour Sepolia
# 2. Obtenir des ETH testnet : https://sepolia-faucet.pk910.de/
# 3. Déployer sur Sepolia
truffle migrate --network sepolia

# 4. Mettre à jour .env avec l'adresse Sepolia
VITE_LOTTERY_ADDRESS=0x[NOUVELLE_ADRESSE_SEPOLIA]

# 5. Configurer MetaMask sur Sepolia Testnet
# 6. Lancer l'application
npm run dev
```

### 🚀 Production (Mainnet)

⚠️ **ATTENTION** : Déploiement sur mainnet = coûts réels en ETH

```bash
# 1. Audit de sécurité obligatoire du smart contract
# 2. Configuration truffle-config.js pour mainnet
# 3. Déploiement (coût ~0.01-0.05 ETH)
truffle migrate --network mainnet

# 4. Mise à jour .env avec l'adresse mainnet
VITE_LOTTERY_ADDRESS=0x[ADRESSE_MAINNET]

# 5. Build de production
npm run build

# 6. Déploiement du frontend
npm run preview
```

## 📜 Scripts Disponibles

```bash
npm run dev         # Serveur de développement Vite
npm run build       # Build de production
npm run preview     # Aperçu du build de production  
npm run lint        # Vérification ESLint
npm run test        # Tests Truffle des smart contracts
```

## 🎯 Smart Contract - Règles de la Loterie

### 📊 Caractéristiques

- **Mise minimum** : 1 ETH par participant
- **Participants maximum** : 10 joueurs par round
- **Répartition des gains** :
  - 90% → Prize Pool (au gagnant)
  - 9% → Jackpot Pool 
  - 1% → Frais (restent dans le contrat)

### 🎲 Mécanisme de Gain

1. **Gagnant Standard** : 1 gagnant aléatoire reçoit 90% des mises
2. **Jackpot Bonus** : 10% de chance de remporter aussi le jackpot cumulé
3. **Reset automatique** : Nouveau round après chaque tirage

### 🔒 Sécurité

- **Propriétaire unique** : Seul le déployeur peut modifier les paramètres
- **Randomness** : Basé sur block.difficulty + block.timestamp
- **Validation** : Vérifications des montants et nombres de participants

## 🌐 Support Multi-Réseaux

L'application détecte automatiquement :

| Environnement | Réseau | Provider | Usage |
|---------------|---------|----------|-------|
| Développement | Ganache Local | HTTP Provider | Tests locaux |
| Test | Sepolia Testnet | MetaMask | Tests publics |
| Production | Ethereum Mainnet | MetaMask | Utilisation réelle |

## 🛠️ Développement

### Structure des Services

```typescript
// Services métier avec séparation des responsabilités
LotteryService    // Interactions smart contract
WalletService     // Gestion comptes/balances  
ParticleService   // Animations UI
```

### Gestion d'État

- **État centralisé** dans `App.tsx`
- **Initialisation asynchrone** des services Web3
- **Gestion d'erreurs** robuste avec diagnostics
- **Messages utilisateur** contextuels

### Tests

```bash
# Tests des smart contracts
npm run test

# Tests unitaires (à implémenter)
# npm test
```

## 🚨 Troubleshooting

### Problèmes Courants

**❌ "Contract non trouvé"**
```bash
# Vérifier que l'adresse dans .env correspond au contrat déployé
# Vérifier que vous êtes sur le bon réseau (Ganache/Sepolia/Mainnet)
```

**❌ "MetaMask non détecté"**
```bash
# Installer MetaMask : https://metamask.io
# Actualiser la page après installation
```

**❌ "Fonds insuffisants"**
```bash
# Ganache : Les comptes ont 1000 ETH par défaut
# Sepolia : Obtenir des ETH via faucet
# Mainnet : Acheter des ETH réels
```

**❌ "Transaction échoue"**
```bash
# Vérifier le gas price et gas limit
# Vérifier que le contrat accepte encore des participants (max 10)
# Vérifier la mise minimum (1 ETH)
```

### Mode Debug

Activez le mode debug dans `.env` :
```bash
VITE_DEBUG_MODE=true
```

Les logs détaillés apparaîtront dans la console du navigateur.

## 📚 Documentation Technique

- [Architecture.md](./Architecture.md) - Architecture détaillée du projet
- [Solidity Documentation](https://docs.soliditylang.org/) - Documentation Solidity
- [Web3.js Documentation](https://web3js.readthedocs.io/) - Documentation Web3.js
- [Truffle Documentation](https://trufflesuite.com/docs/) - Documentation Truffle

## ⚖️ Considérations Légales

⚠️ **IMPORTANT** : Vérifiez la légalité des loteries dans votre juridiction avant le déploiement en production.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ma-fonctionnalite`)
3. Committer les changes (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Push vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🚀 Roadmap

- [ ] Tests unitaires frontend
- [ ] Integration Chainlink VRF pour randomness sécurisé
- [ ] Interface d'administration
- [ ] Support multi-tokens (ERC-20)
- [ ] Analytics et historique des gains
- [ ] Mode tournament multi-rounds

---

**Développé avec ❤️ pour la blockchain Ethereum**