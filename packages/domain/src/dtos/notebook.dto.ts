import { CellType } from '../enums/cellType';
import { RunMode } from '../enums/runMode';

export interface ICreateNotebookDTO {
  projectId: string;
  title: string;
  description?: string;
}

export interface ICellDTO {
  query?: string;
  cellType?: CellType;
  cellId?: number;
  datasources?: string[];
  isActive?: boolean;
  runMode?: RunMode;
}

export interface IUpdateNotebookDTO {
  id: string;
  title?: string;
  description?: string;
  cells?: ICellDTO[];
  datasources?: string[];
}
