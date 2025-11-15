import { Exclude, Expose, plainToClass } from 'class-transformer';
import { Organization } from '../../entities/organization.type';

@Exclude()
export class OrganizationUseCaseDto {
  @Expose()
  public id!: string;
  @Expose()
  public name!: string;
  @Expose()
  public slug!: string;
  @Expose()
  public is_owner!: boolean;
  @Expose()
  public createdAt!: Date;
  @Expose()
  public updatedAt!: Date;
  @Expose()
  public createdBy!: string;
  @Expose()
  public updatedBy!: string;

  public static new(organization: Organization): OrganizationUseCaseDto {
    return plainToClass(OrganizationUseCaseDto, organization);
  }
}
