import { IWorkspaceDTO } from '../../dtos/workspace.dto';
import { WorkspaceUseCaseDto } from '../dto/workspace-usecase-dto';
import { UseCase } from '../usecase';

export type InitWorkspaceUseCase = UseCase<IWorkspaceDTO, WorkspaceUseCaseDto>;
