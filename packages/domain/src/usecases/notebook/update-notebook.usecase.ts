import { NotebookUseCaseDto } from '../dto/notebook-usecase-dto';
import { IUpdateNotebookDTO } from '../../dtos/notebook.dto';
import { UseCase } from '../usecase';

export type UpdateNotebookUseCase = UseCase<
  IUpdateNotebookDTO,
  NotebookUseCaseDto
>;
