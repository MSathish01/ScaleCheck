export interface PredictiveScoreInput {
  category: string;
  accuracyClass: string;
  usageIntensity: string; // LOW, MEDIUM, HIGH, INDUSTRIAL_HEAVY
  installationDate?: Date;
  lastVerifiedAt?: Date | null;
  validityExpiryAt?: Date | null;
  lastObservedError?: number | null;
  maxPermissibleError?: number | null;
}

export interface PredictiveWearResult {
  wearRiskScore: number; // 0.0 to 1.0
  wearCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  predictiveAdvisory: string;
  earlyRenewalRecommended: boolean;
  renewalIncentiveEligible: boolean;
  recommendedVerificationWindowDays: number;
}

export class PredictiveService {
  /**
   * Rules-based predictive wear evaluation engine for Legal Metrology instruments.
   * Analyzes operational drift, usage intensity, environmental exposure, and tolerance margins.
   */
  public static calculateWearRisk(input: PredictiveScoreInput): PredictiveWearResult {
    let baseScore = 0.15;

    // 1. Usage Intensity Factor
    switch (input.usageIntensity.toUpperCase()) {
      case 'INDUSTRIAL_HEAVY': // e.g. weighbridges, cement plants, steel yards
        baseScore += 0.35;
        break;
      case 'HIGH': // e.g. grain mandis, high-traffic fuel dispensers, fish markets
        baseScore += 0.25;
        break;
      case 'MEDIUM': // e.g. retail supermarkets, grocery stores
        baseScore += 0.10;
        break;
      case 'LOW': // e.g. jewelry analytical balances (indoor, low-frequency)
        baseScore += 0.02;
        break;
      default:
        baseScore += 0.10;
    }

    // 2. Instrument Category Inherent Mechanical Wear
    if (input.category.includes('WEIGHBRIDGE') || input.category.includes('MECHANICAL')) {
      baseScore += 0.15; // Mechanical pivot and knife-edge wear
    } else if (input.category.includes('FUEL_DISPENSER') || input.category.includes('FLOW_METER')) {
      baseScore += 0.12; // Piston/rotor meter chamber erosion
    } else if (input.category.includes('ELECTRONIC')) {
      baseScore += 0.05; // Load cell creep / temperature drift
    }

    // 3. Historical Drift / Error Margin Ratio
    if (
      input.lastObservedError !== undefined &&
      input.lastObservedError !== null &&
      input.maxPermissibleError &&
      input.maxPermissibleError > 0
    ) {
      const errorRatio = Math.abs(input.lastObservedError) / input.maxPermissibleError;
      if (errorRatio > 0.8) {
        baseScore += 0.25; // Close to MPE failure boundary
      } else if (errorRatio > 0.5) {
        baseScore += 0.12;
      }
    }

    // 4. Elapsed Time Since Last Verification
    const now = new Date();
    let daysUntilExpiry = 365;
    if (input.validityExpiryAt) {
      const msDiff = new Date(input.validityExpiryAt).getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    }

    if (daysUntilExpiry <= 0) {
      baseScore += 0.30; // Already expired
    } else if (daysUntilExpiry <= 30) {
      baseScore += 0.18;
    } else if (daysUntilExpiry <= 60) {
      baseScore += 0.08;
    }

    // Cap between 0.0 and 1.0
    const finalScore = Math.min(1.0, Math.max(0.0, parseFloat(baseScore.toFixed(2))));

    let wearCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let advisory = 'Optimal operation: Instrument accuracy drift is within safe tolerance margins.';
    let earlyRenewalRecommended = false;
    let windowDays = 90;

    if (finalScore >= 0.75) {
      wearCategory = 'CRITICAL';
      advisory = 'High Wear Risk: Operating under severe load/drift. Early re-verification strongly advised within 15 days to prevent statutory penalties and consumer disputes.';
      earlyRenewalRecommended = true;
      windowDays = 15;
    } else if (finalScore >= 0.50) {
      wearCategory = 'HIGH';
      advisory = 'Elevated Drift Pattern: Usage intensity suggests accelerated mechanical/sensor wear. Recommend booking re-verification 30 days prior to mandatory expiry.';
      earlyRenewalRecommended = true;
      windowDays = 30;
    } else if (finalScore >= 0.30) {
      wearCategory = 'MODERATE';
      advisory = 'Moderate Usage: Instrument is performing nominally. Plan standard annual reverification as scheduled.';
      earlyRenewalRecommended = false;
      windowDays = 60;
    }

    // Early-Renewal Incentive: Eligible if applying > 30 days before expiry with moderate/high compliance
    const renewalIncentiveEligible = daysUntilExpiry > 30 && daysUntilExpiry <= 90;

    return {
      wearRiskScore: finalScore,
      wearCategory,
      predictiveAdvisory: advisory,
      earlyRenewalRecommended,
      renewalIncentiveEligible,
      recommendedVerificationWindowDays: windowDays
    };
  }
}
