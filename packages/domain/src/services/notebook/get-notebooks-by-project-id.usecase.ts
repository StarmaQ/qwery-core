import { NotebookRepositoryPort } from '../../repositories/notebook-repository.port';
import {
  GetNotebooksByProjectIdUseCase,
  NotebookUseCaseDto,
} from '../../usecases';

export class GetNotebooksByProjectIdService
  implements GetNotebooksByProjectIdUseCase
{
  constructor(private readonly notebookRepository: NotebookRepositoryPort) {}

  public async execute(projectId: string): Promise<NotebookUseCaseDto[]> {
    const notebooks = await this.notebookRepository.findByProjectId(projectId);
    if (!notebooks) {
      return [];
    }
    return notebooks.map((notebook) => NotebookUseCaseDto.new(notebook));
  }
}
