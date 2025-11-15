import { Exclude, Expose, plainToClass } from 'class-transformer';
import { Notebook } from '../../entities/notebook.type';
import { CellType } from '../../enums/cellType';
import { RunMode } from '../../enums/runMode';

type Cell = {
  query?: string;
  cellType?: CellType;
  cellId?: number;
  datasources?: string[];
  isActive?: boolean;
  runMode?: RunMode;
};

@Exclude()
export class NotebookUseCaseDto {
  @Expose()
  public id!: string;
  @Expose()
  public projectId!: string;
  @Expose()
  public name!: string;
  @Expose()
  public title!: string;
  @Expose()
  public description!: string;
  @Expose()
  public slug!: string;
  @Expose()
  public version!: number;
  @Expose()
  public createdAt!: Date;
  @Expose()
  public updatedAt!: Date;
  @Expose()
  public datasources!: string[];
  @Expose()
  public cells!: Cell[];

  public static new(notebook: Notebook): NotebookUseCaseDto {
    return plainToClass(NotebookUseCaseDto, notebook);
  }
}
