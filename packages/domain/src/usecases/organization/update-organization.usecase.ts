import { IUpdateOrganizationDTO } from '../../dtos/organization.dto';
import { OrganizationUseCaseDto } from '../dto/organization-usecase-dto';
import { UseCase } from '../usecase';

export type UpdateOrganizationUseCase = UseCase<
  IUpdateOrganizationDTO,
  OrganizationUseCaseDto
>;
