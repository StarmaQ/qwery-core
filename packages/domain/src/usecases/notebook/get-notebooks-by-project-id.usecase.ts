import { NotebookUseCaseDto } from '../dto/notebook-usecase-dto';
import { UseCase } from '../usecase';

export type GetNotebooksByProjectIdUseCase = UseCase<
  string,
  NotebookUseCaseDto[]
>;
