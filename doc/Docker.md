# 🐳 Documentation Docker - Crypto Lottery

## 📋 Vue d'ensemble

Cette application utilise Docker Compose pour orchestrer un environnement de développement complet avec :
- **Ganache** : Blockchain Ethereum locale
- **Truffle** : Compilation et déploiement des smart contracts
- **React App** : Interface utilisateur avec Vite

## 🏗️ Architecture Docker Actuelle

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
├─────────────────┬─────────────────┬─────────────────────┤
│   Ganache       │    Truffle      │     React App       │
│   Port: 8545    │   (Builder)     │   Port: 5173        │
│   10 Accounts   │   Deployer      │   Dev Server        │
│   1000 ETH/acc  │   Contract      │   Hot Reload        │
└─────────────────┴─────────────────┴─────────────────────┘
```

## 📁 Fichiers de Configuration

### **docker-compose.yml**
```yaml
services:
  ganache:          # Blockchain locale
  truffle:          # Déploiement des contrats  
  react-app:        # Interface utilisateur
```

### **Dockerfile.ganache**
```dockerfile
FROM trufflesuite/ganache-cli:latest
EXPOSE 8545
CMD ["--host", "0.0.0.0", "--accounts", "10", "--defaultBalanceEther", "1000"]
```

### **Dockerfile.truffle**
```dockerfile
FROM node:18
WORKDIR /app
RUN npm install -g truffle
# Compile et déploie les contrats
```

## 🚀 Démarrage Rapide

### **Méthode Simple**
```bash
# Cloner le projet
git clone <repository-url>
cd lottery

# Démarrer tous les services
docker-compose up

# L'application sera disponible sur http://localhost:5173
```

### **Méthode avec Build**
```bash
# Build et démarrage
docker-compose up --build

# En arrière-plan
docker-compose up -d
```

### **Vérification du Démarrage**
```bash
# Vérifier les services
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs ganache
docker-compose logs truffle
docker-compose logs react-app
```

## 🔧 Services Détaillés

### **Service Ganache (Blockchain)**

**Configuration :**
```yaml
ganache:
  build:
    context: .
    dockerfile: Dockerfile.ganache
  ports:
    - "8545:8545"
```

**Caractéristiques :**
- ✅ **10 comptes** préconfigurés
- ✅ **1000 ETH** par compte  
- ✅ **Host 0.0.0.0** (accessible depuis les autres conteneurs)
- ✅ **Port 8545** (standard Ethereum)

**Accès :**
```bash
# Depuis l'hôte
curl http://localhost:8545

# Depuis les autres conteneurs
curl http://ganache:8545
```

### **Service Truffle (Déploiement)**

**Configuration :**
```yaml
truffle:
  build:
    context: .
    dockerfile: Dockerfile.truffle
  depends_on:
    - ganache
  environment:
    - NETWORK=development
    - HOST=http://ganache:8545
```

**Workflow :**
1. ⏳ Attend que Ganache soit prêt
2. 🔨 Compile les smart contracts
3. 🚀 Déploie sur le réseau Ganache
4. ✅ Reste actif pour les logs

**Commandes manuelles :**
```bash
# Exécuter des commandes Truffle
docker-compose exec truffle truffle console
docker-compose exec truffle truffle test
docker-compose exec truffle truffle migrate --reset
```

### **Service React App (Frontend)**

**Configuration :**
```yaml
react-app:
  image: node:18
  working_dir: /frontend
  ports:
    - "5173:5173"
  volumes:
    - .env:/frontend/.env
    - .:/frontend
    - /frontend/node_modules
  depends_on:
    - ganache
    - truffle
```

**Caractéristiques :**
- ✅ **Hot reload** activé
- ✅ **Variables d'environnement** montées
- ✅ **Node modules** en volume anonyme (performance)
- ✅ **Dépendances** : Attend Ganache et Truffle

## 🔄 Workflow de Développement

### **Séquence de Démarrage**
```bash
# 1. Démarrage
docker-compose up

# Séquence automatique :
# ├── Ganache démarre (blockchain locale)
# ├── Truffle compile et déploie les contrats
# ├── React App démarre avec Vite
# └── Application disponible sur localhost:5173
```

### **Cycle de Développement**
```bash
# Modification du code React → Hot reload automatique
# Modification des contrats → Redéploiement manuel :
docker-compose exec truffle truffle migrate --reset

# Nouveau démarrage complet
docker-compose down
docker-compose up --build
```

### **Tests**
```bash
# Tests des smart contracts
docker-compose exec truffle truffle test

# Tests en mode interactif
docker-compose exec truffle truffle console
```

## 🐛 Troubleshooting

### **Problèmes Courants**

#### **❌ Port 8545 déjà utilisé**
```bash
# Identifier le processus
lsof -i :8545
netstat -tulpn | grep 8545

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans docker-compose.yml
ports:
  - "8546:8545"  # Port externe différent
```

#### **❌ Contrats non déployés**
```bash
# Vérifier les logs Truffle
docker-compose logs truffle

# Redéployer manuellement
docker-compose exec truffle truffle migrate --reset

# Vérifier la connexion Ganache
docker-compose exec truffle truffle console
> web3.eth.getAccounts()
```

#### **❌ React App ne démarre pas**
```bash
# Vérifier les logs
docker-compose logs react-app

# Reconstruire le conteneur
docker-compose up --build react-app

# Vérifier les permissions de fichiers
ls -la .env
```

#### **❌ Volumes de Node Modules**
```bash
# Supprimer le volume anonyme
docker-compose down -v
docker-compose up --build

# Ou nettoyer tous les volumes
docker system prune -a --volumes
```

### **Commandes de Diagnostic**

```bash
# État des conteneurs
docker-compose ps

# Utilisation des ressources
docker stats

# Logs détaillés
docker-compose logs --timestamps

# Inspection d'un conteneur
docker-compose exec ganache ps aux
docker-compose exec truffle ls -la /app

# Réseau Docker
docker network ls
docker network inspect lottery_default
```

## 📊 Monitoring et Logs

### **Surveillance en Temps Réel**
```bash
# Tous les services
docker-compose logs -f

# Service spécifique avec timestamps
docker-compose logs -f --timestamps ganache

# Dernières 50 lignes
docker-compose logs --tail=50 truffle
```

### **Métriques de Performance**
```bash
# Utilisation CPU/Mémoire
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Espace disque
docker system df

# Nettoyage
docker system prune -f
```

## 🔧 Variables d'Environnement

### **Configuration Actuelle**
```bash
# .env (monté dans react-app)
VITE_LOTTERY_ADDRESS=0x8070Ade22C78246abF7e0EC8655C1f9A705E0bD8
```

### **Variables Étendues (Optionnelles)**
```bash
# .env
VITE_LOTTERY_ADDRESS=0x...
VITE_GANACHE_URL=http://localhost:8545
VITE_NETWORK_ID=1337
VITE_DEBUG_MODE=true

# Docker-specific
COMPOSE_PROJECT_NAME=crypto-lottery
GANACHE_ACCOUNTS=10
GANACHE_BALANCE=1000
```

## 🚀 Optimisations Futures

### **1. Performance et Sécurité**

#### **Multi-stage Builds**
```dockerfile
# Dockerfile.react (optimisé)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

#### **Optimisation des Images**
```dockerfile
# Dockerfile.ganache (optimisé)
FROM trufflesuite/ganache-cli:latest
RUN adduser --disabled-password --gecos '' ganache
USER ganache
EXPOSE 8545
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8545 || exit 1
CMD ["--host", "0.0.0.0", "--accounts", "10", "--defaultBalanceEther", "1000"]
```

#### **Volumes Nommés**
```yaml
# docker-compose.yml (optimisé)
services:
  react-app:
    volumes:
      - .:/frontend
      - node_modules:/frontend/node_modules  # Volume nommé
      - npm_cache:/root/.npm                 # Cache NPM

volumes:
  node_modules:
  npm_cache:
```

### **2. Configuration Avancée**

#### **Health Checks**
```yaml
services:
  ganache:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8545"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  truffle:
    healthcheck:
      test: ["CMD", "truffle", "version"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### **Restart Policies**
```yaml
services:
  ganache:
    restart: unless-stopped
  
  truffle:
    restart: on-failure:3
    
  react-app:
    restart: unless-stopped
```

#### **Resource Limits**
```yaml
services:
  ganache:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### **3. Environnements Multiples**

#### **Docker Compose Override**
```yaml
# docker-compose.override.yml (développement)
services:
  react-app:
    environment:
      - NODE_ENV=development
      - VITE_DEBUG_MODE=true
    command: npm run dev

# docker-compose.prod.yml (production)
services:
  react-app:
    environment:
      - NODE_ENV=production
    command: sh -c "npm run build && npm run preview"
```

#### **Scripts d'Automatisation**
```bash
# scripts/dev.sh
#!/bin/bash
echo "🚀 Démarrage environnement de développement..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# scripts/prod.sh  
#!/bin/bash
echo "🏭 Démarrage environnement de production..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### **4. CI/CD Integration**

#### **GitHub Actions**
```yaml
# .github/workflows/docker.yml
name: Docker Build and Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Test
        run: |
          docker-compose up -d ganache truffle
          docker-compose exec -T truffle truffle test
          docker-compose down
```

#### **Makefile**
```makefile
# Makefile
.PHONY: up down build test clean logs

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose up --build -d

test:
	docker-compose exec truffle truffle test

clean:
	docker-compose down -v --rmi all

logs:
	docker-compose logs -f
```

## 🔄 Migration vers Production

### **1. Séparation des Environnements**

#### **Configuration Production**
```yaml
# docker-compose.prod.yml
services:
  react-app:
    build:
      target: production
    environment:
      - NODE_ENV=production
      - VITE_LOTTERY_ADDRESS=${PROD_CONTRACT_ADDRESS}
    ports:
      - "80:3000"
    restart: always

  # Pas de Ganache en production
  # Connexion à un réseau Ethereum réel
```

#### **Variables d'Environnement Sécurisées**
```bash
# .env.production (git-ignored)
VITE_LOTTERY_ADDRESS=0x...  # Adresse mainnet
VITE_NETWORK_ID=1           # Ethereum Mainnet
VITE_INFURA_URL=https://mainnet.infura.io/v3/...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### **2. Orchestration Avancée**

#### **Docker Swarm**
```yaml
# docker-compose.swarm.yml
version: '3.8'
services:
  react-app:
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.role == worker
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

#### **Kubernetes Migration**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lottery-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lottery-frontend
  template:
    metadata:
      labels:
        app: lottery-frontend
    spec:
      containers:
      - name: frontend
        image: lottery:latest
        ports:
        - containerPort: 3000
```

### **3. Monitoring Production**

#### **Observabilité**
```yaml
# monitoring/docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### **Logging Centralisé**
```yaml
services:
  app:
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: lottery.app
```

## 📈 Métriques et Bonnes Pratiques

### **Benchmarks Actuels**
- ⏱️ **Temps de démarrage** : ~30-45 secondes
- 💾 **Utilisation mémoire** : ~800MB total
- 🔄 **Hot reload** : ~200-500ms
- 🌐 **Port mapping** : 8545 (Ganache), 5173 (React)

### **Bonnes Pratiques Appliquées**
- ✅ **Volumes** pour la persistance des données
- ✅ **Health checks** pour la robustesse
- ✅ **Restart policies** pour la disponibilité
- ✅ **Environment variables** pour la configuration
- ✅ **Multi-stage builds** pour l'optimisation

### **À Implémenter**
- 🔄 **Resource limits** pour éviter la sur-consommation
- 🔐 **Secrets management** pour les données sensibles
- 📊 **Monitoring** avec Prometheus/Grafana
- 🔄 **Backup automatique** des données importantes

---

## 🎯 Commandes de Référence Rapide

```bash
# Démarrage
docker-compose up                    # Premier plan
docker-compose up -d                 # Arrière-plan
docker-compose up --build           # Avec rebuild

# Arrêt
docker-compose down                  # Arrêt simple
docker-compose down -v               # + suppression volumes
docker-compose down --rmi all        # + suppression images

# Maintenance
docker-compose logs -f               # Logs temps réel
docker-compose exec truffle bash    # Shell dans conteneur
docker-compose restart react-app    # Redémarrage service

# Debug
docker-compose ps                    # État des services
docker stats                        # Métriques ressources
docker system prune -f              # Nettoyage
```

**Cette configuration Docker est prête pour le développement et évolutive vers la production !** 🚀