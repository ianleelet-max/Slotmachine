// Utilitaires de cryptographie légère pour les preuves BORNE et calculs SVB

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSyncHash(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `qc-borne-${hex}-${Date.now().toString(36)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-CA').format(n);
}

export function calculateSVB(detectors: { declenche: boolean; gravite: 'nulle' | 'mineure' | 'majeure'; confiance: number }[]): {
  score: number;
  voie: 'V0' | 'V1' | 'V2' | 'V3';
  verdict: string;
} {
  let score = 100;
  
  for (const d of detectors) {
    if (d.declenche) {
      if (d.gravite === 'majeure') {
        score -= 30 * d.confiance;
      } else if (d.gravite === 'mineure') {
        score -= 12 * d.confiance;
      }
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let voie: 'V0' | 'V1' | 'V2' | 'V3' = 'V1';
  let verdict = 'Aucun changement détecté sur les 7 détecteurs. Certificat intact.';

  if (score >= 90) {
    voie = 'V1';
    verdict = 'Aucun changement détecté sur 7 détecteurs — Attestation de non-changement recommandée (~120 $)';
  } else if (score >= 70) {
    voie = 'V2';
    verdict = 'Changement mineur localisé — Mise à jour ciblée recommandée (~450 $)';
  } else if (score >= 40) {
    voie = 'V3';
    verdict = 'Changements significatifs ou données partielles — Certificat pré-instruit (~780 $)';
  } else {
    voie = 'V0';
    verdict = 'Refonte requise ou aucun certificat exploitable — Processus complet requis';
  }

  return { score, voie, verdict };
}
