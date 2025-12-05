import type { SimpleSchema } from '@qwery/domain/entities';
import type { BusinessEntity, Relationship, VocabularyEntry } from './business-context.types';
import type { PerformanceConfig } from './business-context.config';

// Synonym mappings for common business terms
const BUSINESS_SYNONYMS: Record<string, string[]> = {
  customer: ['client', 'user', 'buyer', 'purchaser'],
  order: ['purchase', 'transaction', 'sale'],
  product: ['item', 'goods', 'merchandise'],
  employee: ['staff', 'worker', 'personnel'],
  department: ['dept', 'division', 'unit'],
  revenue: ['sales', 'income', 'amount', 'total'],
  status: ['state', 'condition'],
  date: ['timestamp', 'time', 'created_at', 'updated_at'],
};

// Plural to singular mappings
const PLURAL_TO_SINGULAR: Record<string, string> = {
  customers: 'customer',
  users: 'user',
  orders: 'order',
  products: 'product',
  employees: 'employee',
  departments: 'department',
  items: 'item',
  transactions: 'transaction',
  sales: 'sale',
};

/**
 * Convert plural to singular
 */
export function toSingular(word: string): string {
  const lower = word.toLowerCase();
  const singular = PLURAL_TO_SINGULAR[lower];
  if (singular) {
    return singular;
  }
  // Simple rules
  if (lower.endsWith('ies')) {
    return lower.slice(0, -3) + 'y';
  }
  if (lower.endsWith('es') && lower.length > 3) {
    return lower.slice(0, -2);
  }
  if (lower.endsWith('s') && lower.length > 1) {
    return lower.slice(0, -1);
  }
  return word;
}

/**
 * Infer business entity name from column name (enhanced)
 */
export function inferBusinessEntity(columnName: string): string {
  let name = columnName.toLowerCase();

  // Remove ID suffixes
  name = name.replace(/_id$|id$/, '');

  // Remove common prefixes
  name = name.replace(/^user_|^customer_|^order_|^product_|^dept_|^item_/, '');

  // Handle compound entities: "order_item" → "Order Item"
  const words = name.split('_').filter((w) => w.length > 0);
  if (words.length === 0) return columnName;

  // Convert to Title Case
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Detect business type from column name and data type (enhanced)
 */
export function detectBusinessType(
  columnName: string,
  dataType: string,
): BusinessEntity['businessType'] {
  const name = columnName.toLowerCase();

  // Relationship indicators
  if (name.endsWith('_id') || name === 'id') {
    return 'relationship';
  }

  // Entity indicators (primary keys or main identifiers)
  if (
    name === 'id' ||
    name.includes('user') ||
    name.includes('customer') ||
    name.includes('order') ||
    (name.endsWith('_key') && dataType.includes('INTEGER'))
  ) {
    return 'entity';
  }

  // Attributes (everything else)
  return 'attribute';
}

/**
 * Calculate entity confidence based on naming patterns and data types
 */
export function calculateEntityConfidence(
  columnName: string,
  dataType: string,
  businessType: BusinessEntity['businessType'],
): number {
  let confidence = 0.5; // base confidence

  const name = columnName.toLowerCase();

  // High confidence indicators
  if (name === 'id' && dataType.includes('INTEGER')) {
    confidence = 0.95;
  } else if (name.endsWith('_id') && dataType.includes('INTEGER')) {
    confidence = 0.9;
  } else if (businessType === 'entity' && name.match(/^(user|customer|order|product)/)) {
    confidence = 0.85;
  } else if (businessType === 'relationship') {
    confidence = 0.8;
  } else if (dataType.includes('VARCHAR') && name.match(/(name|title|description)/)) {
    confidence = 0.75;
  } else if (dataType.includes('DATE') || dataType.includes('TIMESTAMP')) {
    confidence = 0.7;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Check if table name is a system or temp table
 */
export function isSystemOrTempTable(tableName: string): boolean {
  const name = tableName.toLowerCase();
  return (
    name.startsWith('temp_') ||
    name.startsWith('pragma_') ||
    name === 'information_schema' ||
    name.includes('_temp') ||
    name.includes('_tmp') ||
    name.startsWith('pg_') ||
    name.startsWith('sqlite_') ||
    name.startsWith('duckdb_') ||
    name.startsWith('main.') ||
    name.startsWith('temp.')
  );
}

/**
 * Normalize term for deduplication
 */
export function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Group related columns into entities (e.g., user_id, user_name, user_email → User entity)
 */
function groupRelatedColumns(
  columns: Array<{ columnName: string; columnType: string }>,
  tableName: string,
): BusinessEntity[] {
  const entityMap = new Map<string, BusinessEntity>();

  for (const column of columns) {
    const entityName = inferBusinessEntity(column.columnName);
    const businessType = detectBusinessType(column.columnName, column.columnType);
    const confidence = calculateEntityConfidence(
      column.columnName,
      column.columnType,
      businessType,
    );

    const existing = entityMap.get(entityName);
    if (existing) {
      // Merge columns into existing entity
      if (!existing.columns.includes(column.columnName)) {
        existing.columns.push(column.columnName);
      }
      // Update confidence if higher
      existing.confidence = Math.max(existing.confidence, confidence);
    } else {
      entityMap.set(entityName, {
        name: entityName,
        columns: [column.columnName],
        views: [tableName],
        dataType: column.columnType,
        businessType,
        confidence,
      });
    }
  }

  return Array.from(entityMap.values());
}

/**
 * Analyze a single schema to extract business entities (enhanced with pruning)
 * Filters out system and temp tables
 */
export function analyzeSchema(
  schema: SimpleSchema,
  options: {
    skipExisting?: boolean;
    existingEntities?: Map<string, BusinessEntity>;
    confidenceThreshold?: number;
    maxEntities?: number;
  } = {},
): BusinessEntity[] {
  const {
    skipExisting = false,
    existingEntities = new Map(),
    confidenceThreshold = 0.6,
    maxEntities = Infinity,
  } = options;

  const entityMap = new Map<string, BusinessEntity>(); // Group by entity name

  for (const table of schema.tables) {
    // SKIP system and temp tables
    if (isSystemOrTempTable(table.tableName)) {
      continue;
    }

    for (const column of table.columns) {
      // EARLY TERMINATION: Skip if already processed
      if (skipExisting) {
        const entityKey = inferBusinessEntity(column.columnName).toLowerCase();
        if (existingEntities.has(entityKey)) {
          continue;
        }
      }

      const entities = groupRelatedColumns(
        [{ columnName: column.columnName, columnType: column.columnType }],
        table.tableName,
      );

      for (const entity of entities) {
        // PRUNING: Skip if confidence too low
        if (entity.confidence < confidenceThreshold) {
          continue;
        }

        // Group columns by entity name
        const existing = entityMap.get(entity.name);
        if (existing) {
          if (!existing.columns.includes(column.columnName)) {
            existing.columns.push(column.columnName);
          }
          if (!existing.views.includes(table.tableName)) {
            existing.views.push(table.tableName);
          }
          // Update confidence if higher
          existing.confidence = Math.max(existing.confidence, entity.confidence);
        } else {
          entityMap.set(entity.name, entity);
        }
      }
    }
  }

  // Limit total entities (prevent explosion)
  const result = Array.from(entityMap.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxEntities);

  return result;
}

/**
 * Build enhanced vocabulary with synonyms, plurals, and confidence
 */
export function buildVocabulary(
  entities: BusinessEntity[],
  config?: PerformanceConfig,
): Map<string, VocabularyEntry> {
  const minConfidence = config?.minVocabularyConfidence ?? 0.7;
  const vocabulary = new Map<string, VocabularyEntry>();
  const normalizedMap = new Map<string, string>(); // normalized -> original

  for (const entity of entities) {
    // Skip low-confidence entities
    if (entity.confidence < minConfidence) continue;

    const entityNameLower = entity.name.toLowerCase();

    // Create or update vocabulary entry
    let entry = vocabulary.get(entityNameLower);
    if (!entry) {
      entry = {
        businessTerm: entity.name,
        technicalTerms: [],
        confidence: entity.confidence,
        synonyms: BUSINESS_SYNONYMS[entityNameLower] || [],
      };
      vocabulary.set(entityNameLower, entry);
    }

    // Add all columns for this entity
    for (const column of entity.columns) {
      if (!entry.technicalTerms.includes(column)) {
        entry.technicalTerms.push(column);
      }
    }

    // Map technical column names to business terms
    for (const column of entity.columns) {
      const colLower = column.toLowerCase();
      const normalized = normalizeTerm(column);

      // DEDUPLICATION: Use existing entry if normalized term exists
      if (normalizedMap.has(normalized)) {
        const existingKey = normalizedMap.get(normalized)!;
        const existing = vocabulary.get(existingKey)!;

        // Merge technical terms
        if (!existing.technicalTerms.includes(column)) {
          existing.technicalTerms.push(column);
        }
        continue;
      }

      // Exact match - highest confidence
      normalizedMap.set(normalized, colLower);
      if (!vocabulary.has(colLower)) {
        vocabulary.set(colLower, {
          businessTerm: entity.name,
          technicalTerms: [column],
          confidence: 1.0,
          synonyms: BUSINESS_SYNONYMS[entityNameLower] || [],
        });
      }

      // Variations with lower confidence
      const variations = [
        column.replace(/_id$/, ''),
        column.replace(/^user_/, ''),
        column.replace(/^customer_/, ''),
        column.replace(/^order_/, ''),
        toSingular(column),
      ];

      for (const variation of variations) {
        if (variation && variation !== column && variation.length > 0) {
          const varLower = variation.toLowerCase();
          const varNormalized = normalizeTerm(variation);
          if (!normalizedMap.has(varNormalized) && !vocabulary.has(varLower)) {
            normalizedMap.set(varNormalized, varLower);
            vocabulary.set(varLower, {
              businessTerm: entity.name,
              technicalTerms: [column],
              confidence: 0.8,
              synonyms: BUSINESS_SYNONYMS[entityNameLower] || [],
            });
          }
        }
      }
    }
  }

  return vocabulary;
}

/**
 * Build entity relationship graph
 */
export function buildEntityGraph(
  entities: BusinessEntity[],
  relationships: Relationship[],
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  // Initialize graph with all entities
  for (const entity of entities) {
    if (!graph.has(entity.name)) {
      graph.set(entity.name, []);
    }
  }

  // Add relationships to graph
  for (const rel of relationships) {
    // Find entities for the views involved in the relationship
    const fromEntities = entities.filter((e) => e.views.includes(rel.fromView));
    const toEntities = entities.filter((e) => e.views.includes(rel.toView));

    for (const fromEntity of fromEntities) {
      for (const toEntity of toEntities) {
        if (fromEntity.name !== toEntity.name) {
          const connections = graph.get(fromEntity.name) || [];
          if (!connections.includes(toEntity.name)) {
            connections.push(toEntity.name);
            graph.set(fromEntity.name, connections);
          }
        }
      }
    }
  }

  return graph;
}

/**
 * Infer business domain from all schemas (enhanced with confidence)
 */
export function inferDomain(schemas: SimpleSchema[]): { domain: string; confidence: number; keywords: string[]; alternativeDomains: Array<{ domain: string; confidence: number }> } {
  const allColumns = new Set<string>();
  const keywords = new Map<string, number>();

  for (const schema of schemas) {
    for (const table of schema.tables) {
      for (const column of table.columns) {
        const colName = column.columnName.toLowerCase();
        allColumns.add(colName);

        // Extract keywords
        const words = colName.split('_');
        for (const word of words) {
          if (word.length > 2) {
            keywords.set(word, (keywords.get(word) || 0) + 1);
          }
        }
      }
    }
  }

  // Common business domain keywords (extended)
  const domainKeywords: Record<string, string[]> = {
    ecommerce: ['order', 'product', 'cart', 'payment', 'customer', 'purchase', 'shipping'],
    hr: ['employee', 'department', 'position', 'salary', 'hr', 'staff', 'personnel'],
    crm: ['customer', 'contact', 'lead', 'account', 'opportunity', 'client'],
    analytics: ['metric', 'kpi', 'dashboard', 'report', 'analytics', 'measure'],
    finance: ['transaction', 'payment', 'invoice', 'revenue', 'expense', 'budget'],
    inventory: ['product', 'stock', 'warehouse', 'supply', 'item'],
    general: [], // fallback
  };

  const domainScores: Array<{ domain: string; score: number; matchedKeywords: string[] }> = [];

  for (const [domain, keywords_list] of Object.entries(domainKeywords)) {
    let score = 0;
    const matched: string[] = [];

    for (const keyword of keywords_list) {
      const count = keywords.get(keyword) || 0;
      if (count > 0) {
        score += count;
        matched.push(keyword);
      }
    }

    domainScores.push({ domain, score, matchedKeywords: matched });
  }

  // Sort by score
  domainScores.sort((a, b) => b.score - a.score);

  const maxScore = domainScores[0]?.score || 0;
  const totalPossible = Object.values(domainKeywords).flat().length;
  const confidence = maxScore > 0 ? Math.min(maxScore / (totalPossible * 0.3), 1.0) : 0.5;

  const primary = domainScores[0] || { domain: 'general', score: 0, matchedKeywords: [] };
  const alternatives = domainScores
    .slice(1, 4)
    .filter((d) => d.score > 0)
    .map((d) => ({
      domain: d.domain,
      confidence: Math.min(d.score / (totalPossible * 0.3), 1.0),
    }));

  return {
    domain: primary.domain,
    confidence,
    keywords: primary.matchedKeywords,
    alternativeDomains: alternatives,
  };
}

