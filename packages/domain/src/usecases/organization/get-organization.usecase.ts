import { OrganizationUseCaseDto } from '../dto/organization-usecase-dto';
import { UseCase } from '../usecase';

export type GetOrganizationUseCase = UseCase<string, OrganizationUseCaseDto>;

export type GetOrganizationBySlugUseCase = UseCase<
  string,
  OrganizationUseCaseDto
>;
