import { ProjectUseCaseDto } from '../dto/project-usecase-dto';
import { UseCase } from '../usecase';

export type GetProjectUseCase = UseCase<string, ProjectUseCaseDto>;

export type GetProjectBySlugUseCase = UseCase<string, ProjectUseCaseDto>;
