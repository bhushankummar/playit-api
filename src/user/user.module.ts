import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/UserEntity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    imports: [
        TypeOrmModule.forFeature([UserEntity])
    ],
    providers: [UserService]
})
export class UserModule { }
