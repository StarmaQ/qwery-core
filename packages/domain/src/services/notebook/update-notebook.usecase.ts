import { Code } from '../../common/code';
import { DomainException } from '../../exceptions';
import { IUpdateNotebookDTO } from '../../dtos/notebook.dto';
import { NotebookEntity } from '../../entities/notebook.type';
import { NotebookRepositoryPort } from '../../repositories/notebook-repository.port';
import { NotebookUseCaseDto } from '../../usecases/dto/notebook-usecase-dto';
import { UpdateNotebookUseCase } from '../../usecases';

export class UpdateNotebookService implements UpdateNotebookUseCase {
  constructor(private readonly notebookRepository: NotebookRepositoryPort) {}

  public async execute(
    notebookDTO: IUpdateNotebookDTO,
  ): Promise<NotebookUseCaseDto> {
    const existingNotebook = await this.notebookRepository.findById(
      notebookDTO.id,
    );
    if (!existingNotebook) {
      throw DomainException.new({
        code: Code.NOTEBOOK_NOT_FOUND_ERROR,
        overrideMessage: `Notebook with id '${notebookDTO.id}' not found`,
        data: { notebookId: notebookDTO.id },
      });
    }

    const newNotebook = NotebookEntity.update(existingNotebook, notebookDTO);

    const notebook = await this.notebookRepository.update(newNotebook);
    return NotebookUseCaseDto.new(notebook);
  }
}
