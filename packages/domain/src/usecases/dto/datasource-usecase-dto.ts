import { Exclude, Expose, plainToClass } from 'class-transformer';
import { Datasource, DatasourceKind } from '../../entities/datasource.type';

@Exclude()
export class DatasourceUseCaseDto {
  @Expose()
  public id!: string;
  @Expose()
  public projectId!: string;
  @Expose()
  public name!: string;
  @Expose()
  public description!: string;
  @Expose()
  public slug!: string;
  @Expose()
  public datasource_provider!: string;
  @Expose()
  public datasource_driver!: string;
  @Expose()
  public datasource_kind!: DatasourceKind;
  @Expose()
  public config!: Record<string, unknown>;
  @Expose()
  public createdAt!: Date;
  @Expose()
  public updatedAt!: Date;
  @Expose()
  public createdBy!: string;
  @Expose()
  public updatedBy!: string;

  public static new(datasource: Datasource): DatasourceUseCaseDto {
    return plainToClass(DatasourceUseCaseDto, datasource);
  }
}
