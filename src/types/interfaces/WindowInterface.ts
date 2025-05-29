// types/interfaces/WindowInterface.ts

interface WindowInterface {
  ethereum?: {
    sendAsync: any;
    send: any;
    enable(): Promise<string[]>;
    
    // Version améliorée de request avec types plus flexibles
    request?(args: { 
      method: string; 
      params?: any[] 
    }): Promise<any>;
    
    isMetaMask?: boolean;
    networkVersion?: string;
    selectedAddress?: string | null;
    chainId?: string;
    
    // Événements MetaMask
    on?(event: string, callback: (...args: any[]) => void): void;
    removeListener?(event: string, callback: (...args: any[]) => void): void;
    
    // Propriétés supplémentaires utiles
    isConnected?(): boolean;
    _metamask?: {
      isUnlocked?(): Promise<boolean>;
    };
  };
}

export default WindowInterface;