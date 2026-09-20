import { BOMItem, HermesWorldState, SupplierSource } from '../types/hermes';

export type HumanMaterialStage =
  | 'REQUIRED'
  | 'PRICED'
  | 'PURCHASED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'STAGED'
  | 'STAGED_UNVERIFIED'
  | 'ALLOCATED'
  | 'CARRIED'
  | 'INSTALLED'
  | 'CONSUMED'
  | 'DAMAGED'
  | 'WASTE'
  | 'RETURNED'
  | 'UNKNOWN';

export interface MaterialDemandLine {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  quantitySource?: string;
  procurementQuantity?: number;
  wastePercent?: number;
  materialUnitCostUSD?: number;
  laborUnitCostUSD?: number;
  equipmentUnitCostUSD?: number;
  extendedScopedCostUSD?: number;
  priceOrigin?: string;
  supplierName?: string;
  leadTimeDays?: number;
  leadTimeWeeks?: number;
  confidence?: number;
  linkedComponentIds: string[];
  source: 'WORLD_BOM' | 'PROJECT_BOM';
}

export interface PhysicalMaterialBatch {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  stage: HumanMaterialStage;
  stageLabel: string;
  verificationStatus?: string;
  currentLocation?: string;
  supplierName?: string;
  targetComponentId?: string;
  assignedTaskId?: string;
  carriedByAgentId?: string;
  stagingZoneId?: string;
  worldPosition?: [number, number, number];
  dimensions?: [number, number, number];
  createdCheckpoint?: number;
  movementHistory?: Array<{ timestamp: string; position: [number, number, number]; status: string }>;
  truthWarnings: string[];
}

export interface MaterialSupplierSummary {
  id: string;
  name: string;
  category?: string;
  address?: string;
  distanceMiles?: number;
  leadTimeDays?: number;
  products: Array<{
    name: string;
    price: number;
    unit: string;
    availability: string;
  }>;
}

export interface MaterialWorkspaceAttention {
  id: string;
  severity: 'INFO' | 'WARNING';
  title: string;
  detail?: string;
  materialBatchId?: string;
}

export interface MaterialWorkspaceState {
  demandLines: MaterialDemandLine[];
  physicalBatches: PhysicalMaterialBatch[];
  suppliers: MaterialSupplierSummary[];
  summary: {
    requirementLineCount: number;
    physicalBatchCount: number;
    onSiteBatchCount: number;
    installedBatchCount: number;
    inTransitBatchCount: number;
    exceptionCount: number;
    canonicalTurnkeyCostUSD?: number;
    canonicalMaterialsCostUSD?: number;
  };
  attention: MaterialWorkspaceAttention[];
}

function vector3(value: unknown): [number, number, number] | undefined {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const numbers = value.slice(0, 3).map(Number);
  if (numbers.some((entry) => !Number.isFinite(entry))) return undefined;
  return numbers as [number, number, number];
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function worldDemandLines(state: HermesWorldState): MaterialDemandLine[] {
  return (state.bomItems || []).map((record: any, index: number) => ({
    id: record.itemId || record.id || 'WORLD-BOM-' + String(index + 1),
    name: record.description || record.item || record.itemId || 'Material requirement',
    category: record.category,
    quantity: finiteNumber(record.quantity) ?? finiteNumber(record.modeledQuantity) ?? 0,
    unit: record.unitOfMeasure || record.unit || 'unit',
    quantitySource: record.quantitySource,
    procurementQuantity: finiteNumber(record.procurementQuantity || record.quantityProcurement),
    wastePercent: finiteNumber(record.wastePercent || record.wasteFactorPct),
    materialUnitCostUSD: finiteNumber(record.materialUnitCostUSD || record.unitPriceUSD),
    laborUnitCostUSD: finiteNumber(record.laborUnitCostUSD),
    equipmentUnitCostUSD: finiteNumber(record.equipmentUnitCostUSD),
    extendedScopedCostUSD: finiteNumber(record.extendedCostUSD || record.estimatedTotalCost),
    priceOrigin: record.priceOrigin || record.priceSource,
    supplierName: record.supplierName || record.supplier,
    leadTimeWeeks: finiteNumber(record.leadTimeWeeks),
    confidence: finiteNumber(record.confidence),
    linkedComponentIds: [
      ...(Array.isArray(record.sourceComponentIds) ? record.sourceComponentIds : []),
      ...(Array.isArray(record.linked3DComponents) ? record.linked3DComponents : []),
    ],
    source: 'WORLD_BOM' as const,
  }));
}

function projectDemandLines(bom: BOMItem[] = []): MaterialDemandLine[] {
  return bom.map((record) => ({
    id: record.id,
    name: record.item,
    category: record.category,
    quantity: record.quantityModeled ?? record.modeledQuantity ?? 0,
    unit: record.unit,
    quantitySource: record.quantitySource,
    procurementQuantity: record.quantityProcurement ?? record.procurementQuantity,
    wastePercent: record.wasteFactorPct ?? record.wastePercent,
    materialUnitCostUSD: record.unitPriceUSD ?? record.unitPrice,
    extendedScopedCostUSD: record.estimatedTotalCost,
    priceOrigin: record.priceSource,
    supplierName: record.supplier ?? record.supplierName,
    leadTimeWeeks: record.leadTimeWeeks,
    confidence: record.confidence,
    linkedComponentIds:
      record.linked3DComponents?.length
        ? record.linked3DComponents
        : record.sourceComponentIds || [],
    source: 'PROJECT_BOM' as const,
  }));
}

function deriveBatchStage(record: any): {
  stage: HumanMaterialStage;
  stageLabel: string;
  warnings: string[];
} {
  const status = String(record?.status || '').toUpperCase();
  const location = String(record?.currentLocation || '').toUpperCase();
  const verification = String(record?.verificationStatus || '').toUpperCase();
  const warnings: string[] = [];

  const explicit: Record<string, HumanMaterialStage> = {
    PLANNED: 'REQUIRED',
    ORDERED: 'PURCHASED',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    STAGED: 'STAGED',
    ALLOCATED: 'ALLOCATED',
    CARRIED: 'CARRIED',
    INSTALLED: 'INSTALLED',
    CONSUMED: 'CONSUMED',
    DAMAGED: 'DAMAGED',
    WASTE: 'WASTE',
    RETURNED: 'RETURNED',
  };

  if (explicit[status]) {
    return {
      stage: explicit[status],
      stageLabel: explicit[status].replace(/_/g, ' '),
      warnings,
    };
  }

  if (verification === 'INSTALLED' || location === 'INSTALLED_BUILDING') {
    return { stage: 'INSTALLED', stageLabel: 'Installed', warnings };
  }

  if (location === 'TRANSIT_TRUCK') {
    return { stage: 'IN_TRANSIT', stageLabel: 'In transit', warnings };
  }

  if (location === 'OFFSITE_SUPPLIER') {
    if (verification === 'PURCHASED') {
      return { stage: 'PURCHASED', stageLabel: 'Purchased / off site', warnings };
    }
    return { stage: 'REQUIRED', stageLabel: 'Off site', warnings };
  }

  if (location === 'LAYDOWN_YARD') {
    if (verification === 'DELIVERED_VERIFIED') {
      return { stage: 'STAGED', stageLabel: 'Staged on site — delivery verified', warnings };
    }

    if (verification === 'PURCHASED') {
      warnings.push('Physical laydown-yard location is recorded, but delivery verification is only PURCHASED.');
      return {
        stage: 'STAGED_UNVERIFIED',
        stageLabel: 'On site location recorded — delivery not verified',
        warnings,
      };
    }

    warnings.push('Physical laydown-yard location is recorded without verified delivery status.');
    return {
      stage: 'STAGED_UNVERIFIED',
      stageLabel: 'On site location recorded — unverified',
      warnings,
    };
  }

  if (verification === 'DELIVERED_VERIFIED') {
    return { stage: 'DELIVERED', stageLabel: 'Delivery verified', warnings };
  }

  if (verification === 'PURCHASED') {
    return { stage: 'PURCHASED', stageLabel: 'Purchased', warnings };
  }

  if (verification === 'ESTIMATED') {
    return { stage: 'REQUIRED', stageLabel: 'Estimated / planned', warnings };
  }

  return { stage: 'UNKNOWN', stageLabel: 'Status not recorded', warnings };
}

function physicalBatches(state: HermesWorldState): PhysicalMaterialBatch[] {
  return (state.materialsOnsite || []).map((record: any, index: number) => {
    const derived = deriveBatchStage(record);
    return {
      id: record.materialBatchId || record.materialId || record.id || 'MATERIAL-' + String(index + 1),
      name: record.name || record.materialType || record.materialBatchId || 'Material batch',
      category: record.category || record.type,
      quantity: finiteNumber(record.quantity) ?? 0,
      unit: record.unit || 'unit',
      stage: derived.stage,
      stageLabel: derived.stageLabel,
      verificationStatus: record.verificationStatus,
      currentLocation: record.currentLocation || record.status,
      supplierName: record.supplierName,
      targetComponentId: record.targetComponentId,
      assignedTaskId: record.assignedTaskId,
      carriedByAgentId: record.carriedByAgentId,
      stagingZoneId: record.stagingZoneId,
      worldPosition: vector3(record.worldPosition || record.currentPosition),
      dimensions: vector3(record.dimensionsXYZ || record.dimensionsMeters),
      createdCheckpoint: finiteNumber(record.createdCheckpoint),
      movementHistory: Array.isArray(record.movementHistory) ? record.movementHistory : undefined,
      truthWarnings: derived.warnings,
    };
  });
}

function supplierSummaries(suppliers: SupplierSource[] = []): MaterialSupplierSummary[] {
  return suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    category: supplier.category,
    address: supplier.address,
    distanceMiles: supplier.distanceMiles,
    leadTimeDays: supplier.leadTimeDays,
    products: (supplier.verifiedProducts || []).map((product) => ({
      name: product.name,
      price: product.price,
      unit: product.unit,
      availability: product.availability,
    })),
  }));
}

export function deriveMaterialWorkspaceState(
  state: HermesWorldState,
  options?: {
    projectBom?: BOMItem[];
    suppliers?: SupplierSource[];
  }
): MaterialWorkspaceState {
  const liveDemand = worldDemandLines(state);
  const fallbackProjectDemand = liveDemand.length === 0 ? projectDemandLines(options?.projectBom) : [];
  const demandLines = liveDemand.length > 0 ? liveDemand : fallbackProjectDemand;
  const batches = physicalBatches(state);
  const suppliers = supplierSummaries(options?.suppliers);

  const attention: MaterialWorkspaceAttention[] = [];

  for (const batch of batches) {
    for (const warning of batch.truthWarnings) {
      attention.push({
        id: 'material-truth-' + batch.id,
        severity: 'WARNING',
        title: 'Material verification needs attention',
        detail: warning,
        materialBatchId: batch.id,
      });
    }

    if (['DAMAGED', 'WASTE', 'RETURNED'].includes(batch.stage)) {
      attention.push({
        id: 'material-exception-' + batch.id,
        severity: 'WARNING',
        title: batch.stageLabel,
        detail: batch.name,
        materialBatchId: batch.id,
      });
    }
  }

  const costScope: any = state.costScopeBreakdown;

  return {
    demandLines,
    physicalBatches: batches,
    suppliers,
    summary: {
      requirementLineCount: demandLines.length,
      physicalBatchCount: batches.length,
      onSiteBatchCount: batches.filter((batch) =>
        ['STAGED', 'STAGED_UNVERIFIED', 'ALLOCATED', 'CARRIED', 'INSTALLED', 'CONSUMED'].includes(batch.stage)
      ).length,
      installedBatchCount: batches.filter((batch) =>
        ['INSTALLED', 'CONSUMED'].includes(batch.stage)
      ).length,
      inTransitBatchCount: batches.filter((batch) => batch.stage === 'IN_TRANSIT').length,
      exceptionCount: attention.length,
      canonicalTurnkeyCostUSD: finiteNumber(costScope?.turnkeyTotalUSD),
      canonicalMaterialsCostUSD: finiteNumber(costScope?.materialsTotalUSD),
    },
    attention,
  };
}
