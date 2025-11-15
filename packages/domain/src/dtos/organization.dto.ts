export interface ICreateOrganizationDTO {
  name: string;
  is_owner: boolean;
  createdBy: string;
}

export interface IUpdateOrganizationDTO {
  id: string; // Used to find the entity, not updated
  name?: string;
  is_owner?: boolean;
  updatedBy?: string;
}
