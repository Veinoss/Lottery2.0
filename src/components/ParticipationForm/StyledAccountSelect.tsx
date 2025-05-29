import React, { useState, useRef, useEffect } from 'react';

/**
 * Composant AccountSelect stylisé - Dropdown moderne avec glassmorphisme
 * Responsabilité : Sélection de compte avec design avancé
 */
interface AccountSelectProps {
  selectedAccount: string | number;
  balances: string[];
  onChange: (value: string) => void;
}

interface AccountOption {
  value: number;
  label: string;
  balance: string;
  formattedBalance: string;
}

const StyledAccountSelect: React.FC<AccountSelectProps> = ({ 
  selectedAccount, 
  balances, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Formatage des options
  const options: AccountOption[] = Array.from({ length: 10 }, (_, i) => ({
    value: i,
    label: `Compte ${i + 1}`,
    balance: balances[i] || '0',
    formattedBalance: balances[i] ? parseFloat(balances[i]).toFixed(4) : '...'
  }));

  // Gestion des clics en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionSelect(options[highlightedIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, options]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHighlightedIndex(-1);
  };

  const handleOptionSelect = (option: AccountOption) => {
    onChange(option.value.toString());
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const getSelectedOption = (): AccountOption | null => {
    if (selectedAccount === '') return null;
    const index = typeof selectedAccount === 'string' ? parseInt(selectedAccount) : selectedAccount;
    return options[index] || null;
  };

  const selectedOption = getSelectedOption();

  return (
    <div ref={dropdownRef} className="custom-dropdown-container">
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-content">
          {selectedOption ? (
            <div className="selected-account">
              <div className="account-main">
                <span className="account-icon">💼</span>
                <span className="account-label">{selectedOption.label}</span>
              </div>
              <div className="account-balance">
                <span className="balance-amount">{selectedOption.formattedBalance}</span>
                <span className="balance-unit">ETH</span>
              </div>
            </div>
          ) : (
            <div className="placeholder-content">
              <span className="placeholder-icon">👆</span>
              <span className="placeholder-text">Sélectionnez votre compte...</span>
            </div>
          )}
        </div>
        
        <div className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="custom-dropdown-menu">
          <div className="dropdown-header">
            <span className="header-icon">🏦</span>
            <span className="header-text">Choisissez votre portefeuille</span>
          </div>
          
          <div className="dropdown-options">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={`dropdown-option ${
                  highlightedIndex === index ? 'highlighted' : ''
                } ${
                  selectedOption?.value === option.value ? 'selected' : ''
                }`}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="option-content">
                  <div className="option-main">
                    <div className="account-number">
                      <span className="account-index">{option.value + 1}</span>
                    </div>
                    <div className="account-info">
                      <span className="account-name">{option.label}</span>
                      <span className="account-address">
                        {/* Vous pouvez ajouter l'adresse tronquée ici */}
                        0x{(option.value + 1).toString().padStart(4, '0')}...
                      </span>
                    </div>
                  </div>
                  
                  <div className="option-balance">
                    <span className="balance-value">{option.formattedBalance}</span>
                    <span className="balance-currency">ETH</span>
                    <div className="balance-indicator">
                      {parseFloat(option.balance) >= 1 ? (
                        <span className="sufficient">✓</span>
                      ) : (
                        <span className="insufficient">⚠</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Indicateur de suffisance des fonds */}
                <div className={`balance-bar ${parseFloat(option.balance) >= 1 ? 'sufficient' : 'insufficient'}`}>
                  <div 
                    className="balance-fill" 
                    style={{ 
                      width: `${Math.min((parseFloat(option.balance) / 1000) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="dropdown-footer">
            <span className="footer-text">💡 Mise requise: 1 ETH minimum</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyledAccountSelect;