import { DatasourceUseCaseDto } from '../dto/datasource-usecase-dto';
import { IUpdateDatasourceDTO } from '../../dtos/datasource.dto';
import { UseCase } from '../usecase';

export type UpdateDatasourceUseCase = UseCase<
  IUpdateDatasourceDTO,
  DatasourceUseCaseDto
>;
