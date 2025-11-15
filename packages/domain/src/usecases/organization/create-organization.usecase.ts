import { ICreateOrganizationDTO } from '../../dtos/organization.dto';
import { OrganizationUseCaseDto } from '../dto/organization-usecase-dto';
import { UseCase } from '../usecase';

export type CreateOrganizationUseCase = UseCase<
  ICreateOrganizationDTO,
  OrganizationUseCaseDto
>;
