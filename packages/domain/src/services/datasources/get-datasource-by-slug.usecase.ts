import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { DatasourceRepositoryPort } from '../../repositories/datasource-repository.port';
import {
  DatasourceUseCaseDto,
  GetDatasourceUseCase,
  GetDatasourceBySlugUseCase,
} from '../../usecases';

export class GetDatasourceService implements GetDatasourceUseCase {
  constructor(
    private readonly datasourceRepository: DatasourceRepositoryPort,
  ) {}

  public async execute(id: string): Promise<DatasourceUseCaseDto> {
    const datasource = await this.datasourceRepository.findById(id);
    if (!datasource) {
      throw DomainException.new({
        code: Code.DATASOURCE_NOT_FOUND_ERROR,
        overrideMessage: `Datasource with id '${id}' not found`,
        data: { id },
      });
    }
    return DatasourceUseCaseDto.new(datasource);
  }
}

export class GetDatasourceBySlugService implements GetDatasourceBySlugUseCase {
  constructor(
    private readonly datasourceRepository: DatasourceRepositoryPort,
  ) {}

  public async execute(slug: string): Promise<DatasourceUseCaseDto> {
    const datasource = await this.datasourceRepository.findBySlug(slug);
    if (!datasource) {
      throw DomainException.new({
        code: Code.DATASOURCE_NOT_FOUND_ERROR,
        overrideMessage: `Datasource with slug '${slug}' not found`,
        data: { slug },
      });
    }
    return DatasourceUseCaseDto.new(datasource);
  }
}
