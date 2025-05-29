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
  balances: string[];
  isLoading: boolean;
  successMessage: string;
  onAccountChange: (value: string) => void;
  onNameChange: (value: string) => void;
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

interface SubmitButtonProps {
  isLoading: boolean;
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

const InfoBox: React.FC = () => (
  <div className="info-box">
    <strong>💡 Mise requise: 1 ETH</strong>
  </div>
);

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, onClick }) => (
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
      '🚀 Participer Maintenant!'
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
  balances,
  isLoading,
  successMessage,
  onAccountChange,
  onNameChange,
  onSubmit
}) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className="panel">
      <h3>🎫 Participer à la Loterie</h3>
      <form className="participation-form" onSubmit={handleSubmit}>
        <FormGroup label="Choisir un compte (0-9)">
          <StyledAccountSelect 
            selectedAccount={selectedAccount}
            balances={balances}
            onChange={onAccountChange}
          />
        </FormGroup>
        
        <FormGroup label="Nom du participant">
          <ParticipantInput 
            value={participantName}
            onChange={onNameChange}
          />
        </FormGroup>
        
        <InfoBox />
        
        <SubmitButton 
          isLoading={isLoading}
          onClick={onSubmit}
        />
        
        <Message message={successMessage} />
      </form>
    </div>
  );
};

export default ParticipationForm;