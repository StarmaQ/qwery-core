import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { IUpdateOrganizationDTO } from '../../dtos/organization.dto';
import {
  Organization,
  OrganizationEntity,
} from '../../entities/organization.type';
import { OrganizationRepositoryPort } from '../../repositories/organization-repository.port';
import { OrganizationUseCaseDto } from '../../usecases/dto/organization-usecase-dto';
import { UpdateOrganizationUseCase } from '../../usecases';

export class UpdateOrganizationService implements UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  public async execute(
    organizationDTO: IUpdateOrganizationDTO,
  ): Promise<OrganizationUseCaseDto> {
    const existingOrganization = await this.organizationRepository.findById(
      organizationDTO.id,
    );
    if (!existingOrganization) {
      throw DomainException.new({
        code: Code.ORGANIZATION_NOT_FOUND_ERROR,
        overrideMessage: `Organization with id '${organizationDTO.id}' not found`,
        data: { organizationId: organizationDTO.id },
      });
    }

    const updatedOrganization = OrganizationEntity.update(
      existingOrganization,
      organizationDTO,
    );
    const organization = await this.organizationRepository.update(
      updatedOrganization as unknown as Organization,
    );
    return OrganizationUseCaseDto.new(organization);
  }
}
