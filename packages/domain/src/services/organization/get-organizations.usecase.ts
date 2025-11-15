import { OrganizationRepositoryPort } from '../../repositories/organization-repository.port';
import {
  GetOrganizationsUseCase,
  OrganizationUseCaseDto,
} from '../../usecases';

export class GetOrganizationsService implements GetOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  public async execute(): Promise<OrganizationUseCaseDto[]> {
    const organizations = await this.organizationRepository.findAll();
    return organizations.map((organization) =>
      OrganizationUseCaseDto.new(organization),
    );
  }
}
