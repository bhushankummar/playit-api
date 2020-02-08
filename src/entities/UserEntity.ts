import {Column, Entity, ObjectID, ObjectIdColumn} from 'typeorm';

@Entity('users')
export class UserEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    email: string;

    @Column()
    google: object;
}