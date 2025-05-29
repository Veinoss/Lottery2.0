import React from 'react';

/**
 * Composant BalanceList - Responsable de l'affichage des balances des comptes
 * Responsabilité : Présentation de la liste des portefeuilles et leurs soldes
 */
interface BalanceListProps {
  balances: string[];
  isLoading?: boolean;
}

interface BalanceItemProps {
  accountNumber: number;
  balance: string;
}

const BalanceItem: React.FC<BalanceItemProps> = ({ accountNumber, balance }) => {
  const formatBalance = (bal: string): string => {
    return parseFloat(bal).toFixed(4);
  };

  return (
    <div className="balance-item">
      <span className="account-number">Compte {accountNumber}</span>
      <span className="balance-amount">{formatBalance(balance)} ETH</span>
    </div>
  );
};

const LoadingBalanceItem: React.FC = () => (
  <div className="balance-item">
    <span className="account-number">Chargement...</span>
    <span className="balance-amount">-- ETH</span>
  </div>
);

const BalanceList: React.FC<BalanceListProps> = ({ balances, isLoading = false }) => {
  return (
    <div className="panel">
      <h3>💼 Portefeuilles Disponibles</h3>
      <div className="balance-list">
        {isLoading || balances.length === 0 ? (
          <LoadingBalanceItem />
        ) : (
          balances.map((balance: string, index: number) => (
            <BalanceItem
              key={index}
              accountNumber={index + 1}
              balance={balance}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BalanceList;