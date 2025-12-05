import type { SimpleSchema } from '@qwery/domain/entities';
import type { BusinessContext, BusinessEntity, VocabularyEntry } from './business-context.types';
import { saveBusinessContext } from './business-context.storage';
import { isSystemOrTempTable } from './business-context.utils';

export interface BuildBusinessContextOptions {
  conversationDir: string;
  viewName: string;
  schema: SimpleSchema;
}

/**
 * Simple entity name inference (fast, no complex logic)
 */
function inferEntityNameFromId(columnName: string): string {
  let name = columnName.toLowerCase();
  // Remove _id or id suffix
  name = name.replace(/_id$|^id$/, '');
  // Remove common prefixes
  name = name.replace(/^user_|^customer_|^order_|^product_|^dept_|^item_/, '');
  // Convert to Title Case
  const words = name.split('_').filter((w) => w.length > 0);
  if (words.length === 0) return columnName;
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build fast business context from schema (primary entities only, < 100ms)
 * TRULY MINIMAL: No file I/O, no merging, no expensive operations
 * Only extracts ID columns and builds minimal vocabulary
 */
export const buildBusinessContext = async (
  opts: BuildBusinessContextOptions,
): Promise<BusinessContext> => {
  const startTime = Date.now();

  // Filter out system/temp tables (synchronous, fast)
  const filteredSchema = {
    ...opts.schema,
    tables: opts.schema.tables.filter((t) => !isSystemOrTempTable(t.tableName)),
  };

  if (filteredSchema.tables.length === 0) {
    throw new Error(`No valid tables found in schema for view: ${opts.viewName}`);
  }

  // FAST PATH: Extract ONLY primary entities (columns ending in _id or id)
  // NO file I/O, NO merging, NO expensive operations
  const entities = new Map<string, BusinessEntity>();
  const vocabulary = new Map<string, VocabularyEntry>();

  for (const table of filteredSchema.tables) {
    for (const column of table.columns) {
      const colName = column.columnName.toLowerCase();

      // ONLY process ID columns
      if (colName.endsWith('_id') || colName === 'id') {
        const entityName = inferEntityNameFromId(column.columnName);
        const entityKey = entityName.toLowerCase();

        // Create or update entity (simple, no complex merging)
        const existing = entities.get(entityKey);
        if (existing) {
          if (!existing.columns.includes(column.columnName)) {
            existing.columns.push(column.columnName);
          }
        } else {
          entities.set(entityKey, {
            name: entityName,
            columns: [column.columnName],
            views: [opts.viewName],
            dataType: column.columnType,
            businessType: 'relationship',
            confidence: 0.8, // Fixed high confidence for IDs
          });
        }

        // Minimal vocabulary - exact match only, no synonyms
        vocabulary.set(colName, {
          businessTerm: entityName,
          technicalTerms: [column.columnName],
          confidence: 1.0,
          synonyms: [],
        });
      }
    }
  }

  // Create minimal context (NO file I/O, NO loading existing context)
  const fastContext: BusinessContext = {
    entities,
    vocabulary,
    relationships: [], // Empty - no relationship detection in fast path
    entityGraph: new Map(), // Empty - no graph building in fast path
    domain: { domain: 'general', confidence: 0.5, keywords: [], alternativeDomains: [] }, // Default - no domain inference in fast path
    views: new Map([
      [
        opts.viewName,
        {
          viewName: opts.viewName,
          schema: filteredSchema,
          entities: Array.from(entities.values()).map((e) => e.name),
          lastAnalyzed: new Date().toISOString(),
        },
      ],
    ]),
    updatedAt: new Date().toISOString(),
  };

  // Save in background (don't await - this is the only I/O and it's async)
  saveBusinessContext(opts.conversationDir, fastContext).catch((err) => {
    console.warn(`[BuildBusinessContext] Failed to save fast context:`, err);
  });

  const elapsed = Date.now() - startTime;
  if (elapsed > 100) {
    console.warn(`[BuildBusinessContext] Fast path took ${elapsed}ms (target: < 100ms) for view: ${opts.viewName}`);
  }

  return fastContext;
};

