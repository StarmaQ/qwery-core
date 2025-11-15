import { DatasourceRepositoryPort } from '../../repositories/datasource-repository.port';
import {
  DatasourceUseCaseDto,
  GetDatasourcesByProjectIdUseCase,
} from '../../usecases';

export class GetDatasourcesByProjectIdService
  implements GetDatasourcesByProjectIdUseCase
{
  constructor(
    private readonly datasourceRepository: DatasourceRepositoryPort,
  ) {}

  public async execute(projectId: string): Promise<DatasourceUseCaseDto[]> {
    const datasources =
      await this.datasourceRepository.findByProjectId(projectId);
    if (!datasources) {
      return [];
    }
    return datasources.map((datasource) =>
      DatasourceUseCaseDto.new(datasource),
    );
  }
}
