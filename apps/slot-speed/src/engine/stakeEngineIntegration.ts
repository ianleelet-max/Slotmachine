import { RGSClient } from 'stake-engine';

class StakeEngineIntegration {
  private client: ReturnType<typeof RGSClient> | null = null;
  private isConnected: boolean = false;
  private devEmail: string = '';

  public async connectToStakeEngine(email: string, rgsUrl: string = 'https://rgs.stake-engine.com'): Promise<boolean> {
    try {
      this.devEmail = email;
      this.client = RGSClient({
        url: rgsUrl,
        enforceBetLevels: true,
        protocol: 'https'
      });

      this.isConnected = true;
      console.log(`✅ [Stake Engine] Connecté avec succès au compte développeur Stake : ${email}`);
      return true;
    } catch (err) {
      console.error('❌ [Stake Engine] Erreur lors de la connexion RGS Stake :', err);
      return false;
    }
  }

  public isStakeConnected(): boolean {
    return this.isConnected;
  }

  public getDevEmail(): string {
    return this.devEmail;
  }
}

export const stakeEngine = new StakeEngineIntegration();
