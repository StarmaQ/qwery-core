import { NotebookUseCaseDto } from '../dto/notebook-usecase-dto';
import { UseCase } from '../usecase';

export type GetNotebookUseCase = UseCase<string, NotebookUseCaseDto>;

export type GetNotebookBySlugUseCase = UseCase<string, NotebookUseCaseDto>;
