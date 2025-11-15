import { DatasourceUseCaseDto } from '../dto/datasource-usecase-dto';
import { UseCase } from '../usecase';

export type GetDatasourceUseCase = UseCase<string, DatasourceUseCaseDto>;

export type GetDatasourceBySlugUseCase = UseCase<string, DatasourceUseCaseDto>;
