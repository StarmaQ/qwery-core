import { ICreateNotebookDTO } from '../../dtos/notebook.dto';
import { NotebookEntity } from '../../entities/notebook.type';
import { NotebookRepositoryPort } from '../../repositories/notebook-repository.port';
import { CreateNotebookUseCase, NotebookUseCaseDto } from '../../usecases';

export class CreateNotebookService implements CreateNotebookUseCase {
  constructor(private readonly notebookRepository: NotebookRepositoryPort) {}

  public async execute(
    notebookDTO: ICreateNotebookDTO,
  ): Promise<NotebookUseCaseDto> {
    const newNotebook = NotebookEntity.create(notebookDTO);

    const notebook = await this.notebookRepository.create(newNotebook);
    return NotebookUseCaseDto.new(notebook);
  }
}
