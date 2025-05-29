import React, { ChangeEvent, FormEvent } from 'react';
import StyledAccountSelect from './StyledAccountSelect';
import './StyledAccountSelect.css';

/**
 * Composant ParticipationForm - Responsable du formulaire de participation
 * Responsabilité : Gestion de l'interface de participation à la loterie
 */
interface ParticipationFormProps {
  selectedAccount: string | number;
  participantName: string;
  betAmount: string;
  balances: string[];
  isLoading: boolean;
  successMessage: string;
  onAccountChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onBetAmountChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
}

interface ParticipantInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface BetAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedAccount: string | number;
  balances: string[];
}

interface SubmitButtonProps {
  isLoading: boolean;
  betAmount: string;
  onClick: () => void;
}

interface MessageProps {
  message: string;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
  </div>
);

const ParticipantInput: React.FC<ParticipantInputProps> = ({ value, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input 
      type="text" 
      className="form-input"
      name="participantName"
      value={value}
      onChange={handleChange}
      placeholder="Entrez votre nom..."
    />
  );
};

const BetAmountInput: React.FC<BetAmountInputProps> = ({ 
  value, 
  onChange, 
  selectedAccount, 
  balances 
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Permettre seulement les nombres et les points décimaux
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  // Calculer le solde disponible pour le compte sélectionné
  const getAvailableBalance = (): string => {
    if (selectedAccount === '' || !balances) return '0';
    const accountIndex = typeof selectedAccount === 'string' ? parseInt(selectedAccount) : selectedAccount;
    return balances[accountIndex] || '0';
  };

  const availableBalance = getAvailableBalance();
  const currentBet = parseFloat(value) || 0;
  const balance = parseFloat(availableBalance) || 0;
  const isValidAmount = currentBet >= 1 && currentBet <= balance;
  const isInsufficientFunds = currentBet > balance;

  return (
    <div className="bet-amount-container">
      <div className="bet-input-wrapper">
        <input 
          type="text" 
          className={`form-input bet-input ${
            value && !isValidAmount ? 'error' : ''
          } ${
            value && isValidAmount ? 'valid' : ''
          }`}
          name="betAmount"
          value={value}
          onChange={handleChange}
          placeholder="1.0"
          min="1"
          step="0.1"
        />
        <span className="currency-label">ETH</span>
      </div>
      
      <div className="bet-info">
        <div className="balance-info">
          <span className="balance-text">
            Solde: <strong>{parseFloat(availableBalance).toFixed(4)} ETH</strong>
          </span>
        </div>
        
        {value && (
          <div className={`validation-message ${isValidAmount ? 'valid' : 'error'}`}>
            {currentBet < 1 ? (
              <span>❌ Minimum 1 ETH</span>
            ) : isInsufficientFunds ? (
              <span>❌ Solde insuffisant</span>
            ) : (
              <span>✅ Montant valide</span>
            )}
          </div>
        )}
      </div>
      
      {selectedAccount !== '' && (
        <div className="quick-amounts">
          <span className="quick-label">Mise rapide:</span>
          <div className="quick-buttons">
            <button 
              type="button" 
              className="quick-btn"
              onClick={() => onChange('1')}
            >
              1 ETH
            </button>
            <button 
              type="button" 
              className="quick-btn"
              onClick={() => onChange('5')}
              disabled={balance < 5}
            >
              5 ETH
            </button>
            <button 
              type="button" 
              className="quick-btn"
              onClick={() => onChange('10')}
              disabled={balance < 10}
            >
              10 ETH
            </button>
            {balance > 20 && (
              <button 
                type="button" 
                className="quick-btn max-btn"
                onClick={() => onChange(Math.floor(balance * 0.9).toString())}
              >
                Max
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBox: React.FC<{ betAmount: string }> = ({ betAmount }) => {
  const amount = parseFloat(betAmount) || 1;
  
  return (
    <div className="info-box enhanced">
      <div className="info-row">
        <span className="info-label">💰 Votre mise:</span>
        <span className="info-value">{amount.toFixed(2)} ETH</span>
      </div>
      <div className="info-row">
        <span className="info-label">🎯 Gain potentiel:</span>
        <span className="info-value">Jackpot total</span>
      </div>
      <div className="info-note">
        <strong>🔒 Mise minimum: 1 ETH</strong>
      </div>
    </div>
  );
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, betAmount, onClick }) => (
  <button 
    type="submit" 
    className={`participate-btn ${isLoading ? 'loading' : ''}`}
    disabled={isLoading}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    {isLoading ? (
      <>
        <span className="spinner"></span>
        Transaction en cours...
      </>
    ) : (
      <>
        🚀 Miser {parseFloat(betAmount) || 1} ETH
      </>
    )}
  </button>
);

const Message: React.FC<MessageProps> = ({ message }) => {
  if (!message) return null;

  const isError = message.includes('❌');
  const messageClass = `message ${isError ? 'error' : 'success'}`;

  return (
    <div className={messageClass}>
      {message}
    </div>
  );
};

const ParticipationForm: React.FC<ParticipationFormProps> = ({
  selectedAccount,
  participantName,
  betAmount,
  balances,
  isLoading,
  successMessage,
  onAccountChange,
  onNameChange,
  onBetAmountChange,
  onSubmit
}) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  // Logique de validation progressive
  const isAccountSelected = selectedAccount !== '';
  const isNameFilled = participantName.trim() !== '';
  const isBetAmountValid = parseFloat(betAmount) >= 1;

  // Messages d'encouragement
  const getProgressMessage = () => {
    if (!isAccountSelected) {
      return "👆 Commencez par sélectionner votre compte";
    }
    if (!isNameFilled) {
      return "✨ Parfait! Maintenant entrez votre nom";
    }
    if (!isBetAmountValid) {
      return "💰 Super! Choisissez maintenant votre mise";
    }
    return "🚀 Tout est prêt! Vous pouvez participer";
  };

  return (
    <div className="panel">
      <h3>🎫 Participer à la Loterie</h3>
      
      {/* Indicateur de progression */}
      <div className="progress-indicator">
        <div className="progress-message">
          {getProgressMessage()}
        </div>
        <div className="progress-steps">
          <div className={`step ${isAccountSelected ? 'completed' : 'current'}`}>1</div>
          <div className={`step ${isNameFilled ? 'completed' : isAccountSelected ? 'current' : 'pending'}`}>2</div>
          <div className={`step ${isBetAmountValid ? 'completed' : isNameFilled ? 'current' : 'pending'}`}>3</div>
          <div className={`step ${isBetAmountValid ? 'current' : 'pending'}`}>4</div>
        </div>
      </div>

      <form className="participation-form" onSubmit={handleSubmit}>
        {/* ÉTAPE 1 : Sélection du compte (toujours visible) */}
        <FormGroup label="Choisir un compte (0-9)">
          <StyledAccountSelect 
            selectedAccount={selectedAccount}
            balances={balances}
            onChange={onAccountChange}
          />
        </FormGroup>
        
        {/* ÉTAPE 2 : Nom du participant (visible si compte sélectionné) */}
        {isAccountSelected && (
          <div className="form-step fade-in">
            <FormGroup label="Nom du participant">
              <ParticipantInput 
                value={participantName}
                onChange={onNameChange}
              />
            </FormGroup>
          </div>
        )}
        
        {/* ÉTAPE 3 : Montant de la mise (visible si nom rempli) */}
        {isAccountSelected && isNameFilled && (
          <div className="form-step fade-in">
            <FormGroup label="Montant de la mise">
              <BetAmountInput
                value={betAmount}
                onChange={onBetAmountChange}
                selectedAccount={selectedAccount}
                balances={balances}
              />
            </FormGroup>
          </div>
        )}
        
        {/* ÉTAPE 4 : Résumé et soumission (visible si tout est valide) */}
        {isAccountSelected && isNameFilled && isBetAmountValid && (
          <div className="form-step fade-in">
            <InfoBox betAmount={betAmount} />
            
            <SubmitButton 
              isLoading={isLoading}
              betAmount={betAmount}
              onClick={onSubmit}
            />
          </div>
        )}
        
        {/* Messages de succès/erreur (toujours visibles si présents) */}
        <Message message={successMessage} />
      </form>
    </div>
  );
};

export default ParticipationForm;