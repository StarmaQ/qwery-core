import { Exclude, Expose, plainToClass } from 'class-transformer';
import { Project } from '../../entities/project.type';

@Exclude()
export class ProjectUseCaseDto {
  @Expose()
  public id!: string;
  @Expose()
  public org_id!: string;
  @Expose()
  public name!: string;
  @Expose()
  public slug!: string;
  @Expose()
  public description!: string;
  @Expose()
  public status!: string;
  @Expose()
  public createdAt!: Date;
  @Expose()
  public updatedAt!: Date;
  @Expose()
  public createdBy!: string;
  @Expose()
  public updatedBy!: string;

  public static new(project: Project): ProjectUseCaseDto {
    return plainToClass(ProjectUseCaseDto, project);
  }
}
