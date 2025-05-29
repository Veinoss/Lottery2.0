import type Particule from "./Particule";

type AppState = {
  /** Liste des comptes Ethereum disponibles */
  accounts: string[];

  /** Soldes des comptes en Ether */
  balanceInEther: string[];

  /** Adresse du propriétaire du contrat */
  owner: string;

  /** Nombre de participants ou données des participants */
  players: string | number;

  /** Valeur générique (peut être utilisée pour différents types de données) */
  value: string;

  /** Compte actuellement sélectionné par l'utilisateur */
  selectedAccount: string | number;

  /** Montant actuel du jackpot */
  jackpot: string;

  /** Nom du participant saisi dans le formulaire */
  name: string;

  /** Montant de la mise sélectionné par l'utilisateur (en ETH) */
  betAmount: string;

  /** Message de succès ou d'erreur à afficher */
  succesMsg: string;

  /** Indicateur de chargement pour les opérations asynchrones */
  isLoading: boolean;

  /** Données des particules pour l'animation d'arrière-plan */
  particles: any[];

  isWeb3Ready?: boolean;
  networkInfo?: {
    networkId: bigint;
    chainId: bigint;
    blockNumber: bigint;
    gasPrice: bigint;
  } | null;
};

export default AppState;
