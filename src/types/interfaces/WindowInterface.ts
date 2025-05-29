// types/interfaces/Window.ts

interface WindowInterface {
  ethereum?: {
    enable(): Promise<string[]>;
    request?(args: { method: string }): Promise<any>;
    isMetaMask?: boolean;
    networkVersion?: string;
    selectedAddress?: string | null;
    on?(event: string, callback: (...args: any[]) => void): void;
    removeListener?(event: string, callback: (...args: any[]) => void): void;
  };
}

export default WindowInterface;