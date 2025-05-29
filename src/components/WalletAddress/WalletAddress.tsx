import React from 'react';

/**
 * Composant WalletAddress - Responsable de l'affichage de l'adresse du portefeuille actif
 * Responsabilité : Présentation de l'adresse du compte sélectionné
 */
interface WalletAddressProps {
  accounts: string[];
  selectedAccount: string | number;
}

const WalletAddress: React.FC<WalletAddressProps> = ({ accounts, selectedAccount }) => {
  const getSelectedAccountAddress = (): string => {
    if (!accounts.length || selectedAccount === '') {
      return "Aucun compte sélectionné";
    }

    const accountIndex = typeof selectedAccount === 'string' 
      ? parseInt(selectedAccount) 
      : selectedAccount;

    if (accountIndex < 0 || accountIndex >= accounts.length) {
      return "Compte invalide";
    }

    return accounts[accountIndex];
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 20) {
      return address;
    }
    
    // Tronque l'adresse pour l'affichage mobile
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const address = getSelectedAccountAddress();
  const isValidAddress = address !== "Aucun compte sélectionné" && address !== "Compte invalide";

  return (
    <div className="panel">
      <h3>🔐 Votre Adresse de Portefeuille Active</h3>
      <div className="wallet-address" title={isValidAddress ? address : undefined}>
        {address}
      </div>
      {isValidAddress && (
        <div style={{ 
          fontSize: '0.8rem', 
          opacity: 0.7, 
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          <span className="mobile-formatted-address">
            {formatAddress(address)}
          </span>
        </div>
      )}
    </div>
  );
};

export default WalletAddress;