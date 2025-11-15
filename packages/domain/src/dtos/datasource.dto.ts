export interface IUpdateDatasourceDTO {
  id: string; // Used to find the entity, not updated
  name?: string;
  description?: string;
  datasource_provider?: string;
  datasource_driver?: string;
  datasource_kind?: string;
  config?: Record<string, unknown>;
  updatedBy?: string;
}
