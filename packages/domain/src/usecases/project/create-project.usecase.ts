import { ICreateProjectDTO } from '../../dtos/project.dto';
import { ProjectUseCaseDto } from '../dto/project-usecase-dto';
import { UseCase } from '../usecase';

export type CreateProjectUseCase = UseCase<
  ICreateProjectDTO,
  ProjectUseCaseDto
>;
