import { ICreateProjectDTO } from '../../dtos/project.dto';
import { Project, ProjectEntity } from '../../entities/project.type';
import { ProjectRepositoryPort } from '../../repositories/project-repository.port';
import { CreateProjectUseCase, ProjectUseCaseDto } from '../../usecases';

export class CreateProjectService implements CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  public async execute(
    projectDTO: ICreateProjectDTO,
  ): Promise<ProjectUseCaseDto> {
    const newProject = ProjectEntity.create(projectDTO);
    const project = await this.projectRepository.create(
      newProject as unknown as Project,
    );
    return ProjectUseCaseDto.new(project);
  }
}
