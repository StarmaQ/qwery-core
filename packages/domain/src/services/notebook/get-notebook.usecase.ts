import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { NotebookRepositoryPort } from '../../repositories/notebook-repository.port';
import {
  GetNotebookBySlugUseCase,
  GetNotebookUseCase,
  NotebookUseCaseDto,
} from '../../usecases';

export class GetNotebookService implements GetNotebookUseCase {
  constructor(private readonly notebookRepository: NotebookRepositoryPort) {}

  public async execute(id: string): Promise<NotebookUseCaseDto> {
    const notebook = await this.notebookRepository.findById(id);
    if (!notebook) {
      throw DomainException.new({
        code: Code.NOTEBOOK_NOT_FOUND_ERROR,
        overrideMessage: `Notebook with id '${id}' not found`,
        data: { notebookId: id },
      });
    }
    return NotebookUseCaseDto.new(notebook);
  }
}

export class GetNotebookBySlugService implements GetNotebookBySlugUseCase {
  constructor(private readonly notebookRepository: NotebookRepositoryPort) {}

  public async execute(id: string): Promise<NotebookUseCaseDto> {
    const notebook = await this.notebookRepository.findBySlug(id);
    if (!notebook) {
      throw DomainException.new({
        code: Code.NOTEBOOK_NOT_FOUND_ERROR,
        overrideMessage: `Notebook with id '${id}' not found`,
        data: { notebookId: id },
      });
    }
    return NotebookUseCaseDto.new(notebook);
  }
}
