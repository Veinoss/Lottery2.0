import Particule from '../types/Particule';

/**
 * Service responsable de la génération et gestion des particules
 * Responsabilité : Création et configuration des particules d'animation
 */
class ParticleService {
  private readonly defaultParticleCount: number = 15;
  private readonly maxDelay: number = 8;
  private readonly minDuration: number = 4;
  private readonly maxDuration: number = 10;

  /**
   * Génère un tableau de particules avec des propriétés aléatoires
   */
  generateParticles(count: number = this.defaultParticleCount): Particule[] {
    const particles: Particule[] = [];
    
    for (let i = 0; i < count; i++) {
      particles.push(this.createParticle(i));
    }
    
    return particles;
  }

  /**
   * Crée une particule individuelle avec des propriétés aléatoires
   */
  private createParticle(id: number): Particule {
    return {
      id,
      left: this.generateRandomPosition(),
      delay: this.generateRandomDelay(),
      duration: this.generateRandomDuration()
    };
  }

  /**
   * Génère une position horizontale aléatoire (0-100%)
   */
  private generateRandomPosition(): number {
    return Math.random() * 100;
  }

  /**
   * Génère un délai d'animation aléatoire
   */
  private generateRandomDelay(): number {
    return Math.random() * this.maxDelay;
  }

  /**
   * Génère une durée d'animation aléatoire
   */
  private generateRandomDuration(): number {
    return Math.random() * (this.maxDuration - this.minDuration) + this.minDuration;
  }

  /**
   * Régénère les particules (utile pour redémarrer l'animation)
   */
  regenerateParticles(currentParticles: Particule[]): Particule[] {
    return this.generateParticles(currentParticles.length);
  }

  /**
   * Ajoute des particules supplémentaires
   */
  addParticles(currentParticles: Particule[], additionalCount: number): Particule[] {
    const newParticles: Particule[] = [];
    const startId = currentParticles.length;
    
    for (let i = 0; i < additionalCount; i++) {
      newParticles.push(this.createParticle(startId + i));
    }
    
    return [...currentParticles, ...newParticles];
  }

  /**
   * Supprime des particules
   */
  removeParticles(currentParticles: Particule[], countToRemove: number): Particule[] {
    return currentParticles.slice(0, -countToRemove);
  }

  /**
   * Met à jour les propriétés d'une particule spécifique
   */
  updateParticle(particles: Particule[], particleId: number, updates: Partial<Particule>): Particule[] {
    return particles.map(particle => 
      particle.id === particleId 
        ? { ...particle, ...updates }
        : particle
    );
  }
}

export default ParticleService;