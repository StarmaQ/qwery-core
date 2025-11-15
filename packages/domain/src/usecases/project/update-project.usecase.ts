import { IUpdateProjectDTO } from '../../dtos/project.dto';
import { ProjectUseCaseDto } from '../dto/project-usecase-dto';
import { UseCase } from '../usecase';

export type UpdateProjectUseCase = UseCase<
  IUpdateProjectDTO,
  ProjectUseCaseDto
>;
