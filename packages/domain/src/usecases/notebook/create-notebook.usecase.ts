import { NotebookUseCaseDto } from '../dto/notebook-usecase-dto';
import { ICreateNotebookDTO } from '../../dtos/notebook.dto';
import { UseCase } from '../usecase';

export type CreateNotebookUseCase = UseCase<
  ICreateNotebookDTO,
  NotebookUseCaseDto
>;
