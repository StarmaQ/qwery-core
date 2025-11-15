import { Roles } from '../common/roles';

export interface ICreateUserDTO {
  username: string;
  role?: Roles;
}

export interface IUpdateUserDTO {
  id: string;
  username?: string;
  role?: Roles;
}
