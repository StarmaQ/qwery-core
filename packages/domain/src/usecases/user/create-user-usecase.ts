import { ICreateUserDTO } from '../../dtos/user.dto';
import { UserUseCaseDto } from '../dto/user-usecase-dto';
import { UseCase } from '../usecase';

export type CreateUserUseCase = UseCase<ICreateUserDTO, UserUseCaseDto>;
