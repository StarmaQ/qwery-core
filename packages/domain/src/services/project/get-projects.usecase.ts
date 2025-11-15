import { ProjectRepositoryPort } from '../../repositories/project-repository.port';
import { GetProjectsUseCase, ProjectUseCaseDto } from '../../usecases';

export class GetProjectsService implements GetProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  public async execute(): Promise<ProjectUseCaseDto[]> {
    const projects = await this.projectRepository.findAll();
    return projects.map((project) => ProjectUseCaseDto.new(project));
  }
}
