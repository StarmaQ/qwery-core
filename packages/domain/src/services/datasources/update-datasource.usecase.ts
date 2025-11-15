import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { IUpdateDatasourceDTO } from '../../dtos/datasource.dto';
import { DatasourceEntity, Datasource } from '../../entities/datasource.type';
import { DatasourceRepositoryPort } from '../../repositories/datasource-repository.port';
import { DatasourceUseCaseDto } from '../../usecases/dto/datasource-usecase-dto';
import { UpdateDatasourceUseCase } from '../../usecases';

export class UpdateDatasourceService implements UpdateDatasourceUseCase {
  constructor(
    private readonly datasourceRepository: DatasourceRepositoryPort,
  ) {}

  public async execute(
    datasourceDTO: IUpdateDatasourceDTO,
  ): Promise<DatasourceUseCaseDto> {
    const existingDatasource = await this.datasourceRepository.findById(
      datasourceDTO.id,
    );
    if (!existingDatasource) {
      throw DomainException.new({
        code: Code.DATASOURCE_NOT_FOUND_ERROR,
        overrideMessage: `Datasource with id '${datasourceDTO.id}' not found`,
        data: { datasourceId: datasourceDTO.id },
      });
    }

    const newDatasource = DatasourceEntity.update(
      existingDatasource,
      datasourceDTO,
    );

    const datasource = await this.datasourceRepository.update(
      newDatasource as unknown as Datasource,
    );
    return DatasourceUseCaseDto.new(datasource);
  }
}
