import { ICreateOrganizationDTO } from '../../dtos/organization.dto';
import {
  Organization,
  OrganizationEntity,
} from '../../entities/organization.type';
import { OrganizationRepositoryPort } from '../../repositories/organization-repository.port';
import {
  CreateOrganizationUseCase,
  OrganizationUseCaseDto,
} from '../../usecases';

export class CreateOrganizationService implements CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  public async execute(
    organizationDTO: ICreateOrganizationDTO,
  ): Promise<OrganizationUseCaseDto> {
    const newOrganization = OrganizationEntity.create(organizationDTO);
    const organization = await this.organizationRepository.create(
      newOrganization as unknown as Organization,
    );
    return OrganizationUseCaseDto.new(organization);
  }
}
