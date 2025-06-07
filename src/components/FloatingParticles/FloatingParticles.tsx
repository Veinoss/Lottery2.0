import React from 'react';
import Particule from '../../types/Particule';

/**
 * Composant FloatingParticles - Responsable de l'affichage des particules flottantes 
 * Responsabilité : Rendu des animations de particules en arrière-plan
 */
interface FloatingParticlesProps {
  particles: Particule[];
}

interface ParticleProps {
  particle: Particule;
}

const Particle: React.FC<ParticleProps> = ({ particle }) => {
  const particleStyle = {
    left: `${particle.left}%`,
    animationDelay: `${particle.delay}s`,
    animationDuration: `${particle.duration}s`
  };

  return (
    <div
      key={particle.id}
      className="particle"
      style={particleStyle}
    />
  );
};

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ particles }) => {
  if (!particles || particles.length === 0) {
    return null;
  }

  return (
    <div className="floating-particles">
      {particles.map((particle: Particule) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </div>
  );
};

export default FloatingParticles;