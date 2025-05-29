interface AppPropsInterface {
  // Props optionnelles pour l'évolution future :
  theme?: "light" | "dark";
  language?: "fr" | "en";
  onConnect?: () => void;
  onDisconnect?: () => void;
  debugMode?: boolean;
  contractAddress?: string;
}

export default AppPropsInterface;
