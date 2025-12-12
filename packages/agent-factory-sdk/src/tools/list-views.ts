import { loadViewRegistry } from './view-registry';
import { listAllTables } from './view-registry';

export interface ListViewsOptions {
  conversationId: string;
  workspace: string;
  forceRefresh?: boolean;
  repositories?: {
    conversation: import('@qwery/domain/repositories').IConversationRepository;
    datasource: import('@qwery/domain/repositories').IDatasourceRepository;
  };
}

export interface ViewInfo {
  viewName: string;
  displayName: string;
  sharedLink: string;
  type: 'view' | 'table' | 'attached_table';
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    lastUsedAt?: string;
    datasourceProvider?: string;
    datasourceType?: 'duckdb-native' | 'foreign-database';
  };
}

export interface ListViewsResult {
  views: ViewInfo[];
  message: string;
}

// Simple cache with 1 minute TTL
const cache = new Map<
  string,
  { result: ListViewsResult; timestamp: number }
>();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Lists all available views (sheets) in the database.
 * Combines data from the view registry (for Google Sheets) and DuckDB (for all database objects).
 * Results are cached for 1 minute to avoid repeated calls.
 */
export const listViews = async (
  opts: ListViewsOptions,
): Promise<ListViewsResult> => {
  const { conversationId, workspace, forceRefresh = false } = opts;

  const cacheKey = `${conversationId}:${workspace}`;

  // Check cache unless forceRefresh is true
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }
  }

  const { join } = await import('node:path');
  const conversationDir = join(workspace, conversationId);

  console.log('[listViews] Starting with:', {
    conversationId: conversationId.substring(0, 20) + '...',
    workspace: workspace.substring(0, 50) + '...',
    conversationDir,
    hasRepositories: !!opts.repositories,
  });

  // CRITICAL: Sync datasources before listing tables
  // Google Sheets are now persistent databases, but we still sync for:
  // 1. Other datasources that may need syncing (foreign databases)
  // 2. Ensuring all datasources are attached to the current connection
  // 3. Consistency with getSchema and runQuery behavior
  if (opts.repositories) {
    try {
      const { DuckDBInstanceManager } = await import('./duckdb-instance-manager');
      const { GetConversationBySlugService } = await import('@qwery/domain/services');
      
      const getConversationService = new GetConversationBySlugService(
        opts.repositories.conversation,
      );
      const conversation = await getConversationService.execute(conversationId);
      
      if (conversation?.datasources?.length) {
        console.log('[listViews] Syncing datasources before listing tables:', {
          datasourceCount: conversation.datasources.length,
        });
        await DuckDBInstanceManager.syncDatasources(
          conversationId,
          workspace,
          conversation.datasources,
          opts.repositories.datasource,
        );
        console.log('[listViews] Datasources synced successfully');
      }
    } catch (error) {
      console.warn('[listViews] Failed to sync datasources:', error);
      // Continue anyway - might still find tables
    }
  }

  // Get all tables/views from DuckDB
  let allTables: string[] = [];
  try {
    allTables = await listAllTables(conversationId, workspace);
    console.log('[listViews] Found tables from DuckDB:', {
      count: allTables.length,
      tables: allTables.slice(0, 10), // Log first 10 for debugging
    });
  } catch (error) {
    console.warn('[listViews] Failed to get tables from DuckDB:', error);
    // Continue with empty array - will rely on registry
  }

  // Load view registry to get metadata about registered views (Google Sheets, etc.)
  let registry: Awaited<ReturnType<typeof loadViewRegistry>> = [];
  try {
    registry = await loadViewRegistry({ conversationDir });
    console.log('[listViews] Loaded view registry:', {
      count: registry.length,
      viewNames: registry.map((r) => r.viewName),
      registryPath: join(conversationDir, 'views.json'),
    });
  } catch (error) {
    console.error('[listViews] Failed to load view registry:', error);
    // Continue with empty array - will rely on DuckDB tables
  }

  // Create a map of registered views for quick lookup
  const registryMap = new Map<string, typeof registry[0]>();
  for (const record of registry) {
    registryMap.set(record.viewName, record);
  }

  // Combine and deduplicate views
  const viewsMap = new Map<string, ViewInfo>();

  // Add all tables/views from DuckDB
  for (const tableName of allTables) {
    // Check if it's in registry (Google Sheet view) or is an attached table
    const isAttachedTable = tableName.includes('.');
    const registryRecord = registryMap.get(tableName);

    if (registryRecord) {
      // Registered view (Google Sheet, etc.)
      viewsMap.set(tableName, {
        viewName: registryRecord.viewName,
        displayName: registryRecord.displayName,
        sharedLink: registryRecord.sharedLink,
        type: 'view',
        metadata: {
          createdAt: registryRecord.createdAt,
          updatedAt: registryRecord.updatedAt,
          lastUsedAt: registryRecord.lastUsedAt,
          datasourceProvider: registryRecord.datasourceProvider,
          datasourceType: registryRecord.datasourceType,
        },
      });
    } else if (isAttachedTable) {
      // Attached database table
      viewsMap.set(tableName, {
        viewName: tableName,
        displayName: tableName,
        sharedLink: '',
        type: 'attached_table',
      });
    } else {
      // DuckDB native table/view
      viewsMap.set(tableName, {
        viewName: tableName,
        displayName: tableName,
        sharedLink: '',
        type: 'table',
      });
    }
  }

  // Also add any registered views that might not be in the database yet
  // This is CRITICAL for Google Sheets that are registered but views might not exist in DuckDB yet
  let addedFromRegistry = 0;
  for (const record of registry) {
    if (!viewsMap.has(record.viewName)) {
      console.log('[listViews] Adding registered view not in DuckDB:', {
        viewName: record.viewName,
        displayName: record.displayName,
        datasourceProvider: record.datasourceProvider,
      });
      viewsMap.set(record.viewName, {
        viewName: record.viewName,
        displayName: record.displayName,
        sharedLink: record.sharedLink,
        type: 'view',
        metadata: {
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          lastUsedAt: record.lastUsedAt,
          datasourceProvider: record.datasourceProvider,
          datasourceType: record.datasourceType,
        },
      });
      addedFromRegistry++;
    }
  }
  
  if (addedFromRegistry > 0) {
    console.log('[listViews] Added views from registry:', addedFromRegistry);
  }

  const views = Array.from(viewsMap.values()).sort((a, b) =>
    a.viewName.localeCompare(b.viewName),
  );

  console.log('[listViews] Final result:', {
    totalViews: views.length,
    fromDuckDB: allTables.length,
    fromRegistry: registry.length,
    addedFromRegistry,
    viewNames: views.map((v) => v.viewName),
  });

  const result: ListViewsResult = {
    views,
    message: `Found ${views.length} available ${views.length === 1 ? 'view' : 'views'}`,
  };

  // Cache the result
  cache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
};

