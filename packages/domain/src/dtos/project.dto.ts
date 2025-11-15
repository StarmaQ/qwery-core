export interface ICreateProjectDTO {
  org_id: string;
  name: string;
  description: string;
  status: string;
  createdBy: string;
}

export interface IUpdateProjectDTO {
  id: string; // Used to find the entity, not updated
  name?: string;
  description?: string;
  status?: string;
  updatedBy?: string;
}
