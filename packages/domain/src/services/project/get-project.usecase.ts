import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { ProjectRepositoryPort } from '../../repositories/project-repository.port';
import {
  GetProjectBySlugUseCase,
  GetProjectUseCase,
  ProjectUseCaseDto,
} from '../../usecases';

export class GetProjectService implements GetProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  public async execute(id: string): Promise<ProjectUseCaseDto> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw DomainException.new({
        code: Code.PROJECT_NOT_FOUND_ERROR,
        overrideMessage: `Project with id '${id}' not found`,
        data: { projectId: id },
      });
    }
    return ProjectUseCaseDto.new(project);
  }
}

export class GetProjectBySlugService implements GetProjectBySlugUseCase {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  public async execute(slug: string): Promise<ProjectUseCaseDto> {
    const project = await this.projectRepository.findBySlug(slug);
    if (!project) {
      throw DomainException.new({
        code: Code.PROJECT_NOT_FOUND_ERROR,
        overrideMessage: `Project with slug '${slug}' not found`,
        data: { projectSlug: slug },
      });
    }
    return ProjectUseCaseDto.new(project);
  }
}
