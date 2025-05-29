import React from 'react';

/**
 * Composant Header - Responsable de l'affichage du titre et sous-titre
 * Responsabilité : Présentation de l'en-tête de l'application
 */
interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "🎰 Crypto Lottery",
  subtitle = "Participez à la loterie décentralisée la plus excitante du Web3!"
}) => {
  return (
    <header className="header">
      <h1 className="title">{title}</h1>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
};

export default Header;