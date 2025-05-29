import React from 'react';

/**
 * Composant StatsGrid - Responsable de l'affichage des statistiques
 * Responsabilité : Présentation des cartes de statistiques (participants, jackpot)
 */
interface StatsGridProps {
  participants: string | number;
  jackpot: string | number;
}

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <div className="stat-card glow-effect">
      <span className="stat-icon">{icon}</span>
      <div className="stat-value">{value || 0}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({ participants, jackpot }) => {
  return (
    <div className="stats-grid">
      <StatCard 
        icon="👥" 
        value={participants} 
        label="Participants" 
      />
      <StatCard 
        icon="💰" 
        value={`${jackpot} ETH`} 
        label="Jackpot" 
      />
    </div>
  );
};

export default StatsGrid;