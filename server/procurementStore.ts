import { PriceTruthClassification } from './realitySwarmEngine';

export interface PriceEvidenceRecord {
  priceId: string;
  supplierName: string;
  specification: string;
  amount: number;
  unit: string;
  sourceDocument: string;
  retrievedAt: string;
  verificationType: PriceTruthClassification;
  expirationDate: string;
  projectId: string;
}

export class ProcurementStore {
  private static priceRecords: Map<string, PriceEvidenceRecord> = new Map();

  public static initialize(): void {
    if (this.priceRecords.size > 0) return;

    // Seed realistic procurement evidence records
    const now = new Date();
    const future30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const past10 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

    this.addRecord({
      priceId: 'PRICE-CONCRETE-001',
      supplierName: 'Tampa Ready-Mix Supply',
      specification: '3000 PSI Exterior Concrete Slab Mix',
      amount: 145,
      unit: 'cu yd',
      sourceDocument: 'QUOTE-2026-TMP-8841.pdf',
      retrievedAt: past10,
      verificationType: 'VERIFIED_CURRENT_QUOTE',
      expirationDate: future30,
      projectId: 'RESIDENCE-TAMPA-001',
    });

    this.addRecord({
      priceId: 'PRICE-REBAR-001',
      supplierName: 'Florida Steel Rebar Inc',
      specification: '#4 Grade 60 Deformed Rebar Bar 20ft',
      amount: 12.50,
      unit: 'bar',
      sourceDocument: 'CATALOG-2026-FL-STEEL.pdf',
      retrievedAt: past10,
      verificationType: 'PUBLISHED_CURRENT_PRICE',
      expirationDate: future30,
      projectId: 'RESIDENCE-TAMPA-001',
    });
  }

  public static addRecord(record: PriceEvidenceRecord): void {
    this.priceRecords.set(record.priceId, record);
  }

  public static getRecord(priceId: string): PriceEvidenceRecord | undefined {
    this.initialize();
    return this.priceRecords.get(priceId);
  }

  public static getAllRecords(): PriceEvidenceRecord[] {
    this.initialize();
    return Array.from(this.priceRecords.values());
  }

  public static derivePriceStatus(priceId: string): {
    classification: PriceTruthClassification;
    record?: PriceEvidenceRecord;
    isExpired: boolean;
    hasEvidence: boolean;
  } {
    this.initialize();
    const rec = this.priceRecords.get(priceId);
    if (!rec) {
      return {
        classification: 'UNKNOWN',
        isExpired: false,
        hasEvidence: false,
      };
    }

    const now = new Date();
    const exp = new Date(rec.expirationDate);
    const isExpired = exp < now;

    let classification: PriceTruthClassification = rec.verificationType;
    if (isExpired && classification === 'VERIFIED_CURRENT_QUOTE') {
      classification = 'HISTORICAL_PRICE';
    }

    return {
      classification,
      record: rec,
      isExpired,
      hasEvidence: true,
    };
  }
}
