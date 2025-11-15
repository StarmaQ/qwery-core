import { DatasourceUseCaseDto } from '../dto/datasource-usecase-dto';
import { UseCase } from '../usecase';

export type GetDatasourcesByProjectIdUseCase = UseCase<
  string,
  DatasourceUseCaseDto[]
>;
