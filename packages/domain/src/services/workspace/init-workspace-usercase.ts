import { v4 as uuidv4 } from 'uuid';
import { classToPlain } from 'class-transformer';

import { Roles } from '../../common/roles';
import {
  Organization,
  OrganizationEntity,
} from '../../entities/organization.type';
import { Project, ProjectEntity } from '../../entities/project.type';
import { User } from '../../entities/user.type';
import { OrganizationRepositoryPort } from '../../repositories/organization-repository.port';
import { ProjectRepositoryPort } from '../../repositories/project-repository.port';
import { UserRepositoryPort } from '../../repositories/user-repository.port';
import { UserUseCaseDto } from '../../usecases/dto/user-usecase-dto';
import { WorkspaceUseCaseDto } from '../../usecases/dto/workspace-usecase-dto';
import { InitWorkspaceUseCase } from '../../usecases/workspace/init-workspace-usecase';
import { WorkspaceModeUseCase } from '../../usecases/workspace/workspace-mode.usecase';
import { NotebookRepositoryPort } from '../../repositories/notebook-repository.port';
import { CreateNotebookService } from '../notebook/create-notebook.usecase';
import { IWorkspaceDTO } from '../../dtos/workspace.dto';

function createAnonymousUser(): User {
  const now = new Date();
  return {
    id: uuidv4(),
    username: 'anonymous',
    role: Roles.SUPER_ADMIN,
    createdAt: now,
    updatedAt: now,
  };
}

function createDefaultOrganization(userId: string): Organization {
  const organization = OrganizationEntity.create({
    name: 'Default Organization',
    is_owner: true,
    createdBy: userId,
  });

  return classToPlain(organization) as Organization;
}

function createDefaultProject(orgId: string, userId: string): Project {
  const project = ProjectEntity.create({
    org_id: orgId,
    name: 'Default Project',
    description: 'Default project created automatically',
    status: 'active',
    createdBy: userId,
  });

  return classToPlain(project) as Project;
}

export class InitWorkspaceService implements InitWorkspaceUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly workspaceModeUseCase: WorkspaceModeUseCase,
    private readonly organizationRepository?: OrganizationRepositoryPort,
    private readonly projectRepository?: ProjectRepositoryPort,
    private readonly notebookRepository?: NotebookRepositoryPort,
  ) {}

  public async execute(port: IWorkspaceDTO): Promise<WorkspaceUseCaseDto> {
    let user: User | null = null;
    let isAnonymous = false;

    if (port.userId) {
      user = await this.userRepository.findById(port.userId);
    }

    if (!user) {
      user = createAnonymousUser();
      isAnonymous = true;
    }

    const userDto = UserUseCaseDto.new(user);

    let organization;
    if (port.organizationId && this.organizationRepository) {
      try {
        organization = await this.organizationRepository.findById(
          port.organizationId,
        );
      } catch (error) {
        console.warn(
          `Organization with id ${port.organizationId} not found, creating default organization`,
          error,
        );
      }
    }

    if (!organization && this.organizationRepository) {
      const organizations = await this.organizationRepository.findAll();
      if (organizations.length > 0) {
        organization = organizations[0];
      } else {
        const defaultOrg = createDefaultOrganization(user.id);
        organization = await this.organizationRepository.create(defaultOrg);
      }
    }

    let project;
    if (port.projectId && this.projectRepository) {
      try {
        project = await this.projectRepository.findById(port.projectId);
      } catch (error) {
        console.warn(
          `Project with id ${port.projectId} not found, creating default project`,
          error,
        );
      }
    }

    if (!project && this.projectRepository && organization) {
      const projects = await this.projectRepository.findAll();
      if (projects.length > 0) {
        project = projects[0];
      } else {
        const defaultProject = createDefaultProject(
          organization.id || uuidv4(),
          user.id,
        );
        project = await this.projectRepository.create(defaultProject);
      }
    }

    if (project != null && this.notebookRepository) {
      const notebooks = await this.notebookRepository.findByProjectId(
        project.id,
      );
      if (!notebooks || notebooks.length === 0) {
        const createNotebookUseCase = new CreateNotebookService(
          this.notebookRepository,
        );
        await createNotebookUseCase.execute({
          projectId: project.id,
          title: 'Default Notebook',
          description: 'Default notebook created automatically',
        });
      }
    }

    const mode = await this.workspaceModeUseCase.execute();

    return WorkspaceUseCaseDto.new({
      user: userDto,
      organization: organization || undefined,
      project: project || undefined,
      mode: mode,
      isAnonymous: isAnonymous,
    });
  }
}
