import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) { }

    async searchOneByEmail(email: string) {
        try {
            const whereCondition: FindOneOptions<UserEntity> = {
                where: {
                    email: email
                }
            };
            const userItem = await this.usersRepository.findOne(whereCondition);
            return userItem;
        } catch (error) {
            console.error('error ', error);
            throw new HttpException(error, HttpStatus.NOT_FOUND);
        }
    }

}
