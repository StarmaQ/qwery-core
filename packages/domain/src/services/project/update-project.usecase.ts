import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { IUpdateProjectDTO } from '../../dtos/project.dto';
import { Project, ProjectEntity } from '../../entities/project.type';
import { ProjectRepositoryPort } from '../../repositories/project-repository.port';
import { ProjectUseCaseDto } from '../../usecases/dto/project-usecase-dto';
import { UpdateProjectUseCase } from '../../usecases';

export class UpdateProjectService implements UpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  public async execute(
    projectDTO: IUpdateProjectDTO,
  ): Promise<ProjectUseCaseDto> {
    const existingProject = await this.projectRepository.findById(
      projectDTO.id,
    );
    if (!existingProject) {
      throw DomainException.new({
        code: Code.PROJECT_NOT_FOUND_ERROR,
        overrideMessage: `Project with id '${projectDTO.id}' not found`,
        data: { projectId: projectDTO.id },
      });
    }

    const updatedProject = ProjectEntity.update(existingProject, projectDTO);
    const project = await this.projectRepository.update(
      updatedProject as unknown as Project,
    );
    return ProjectUseCaseDto.new(project);
  }
}
