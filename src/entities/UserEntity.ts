import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
export class UserEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Index({ unique: true })
    @Column()
    email: string;

    @Column()
    google: object;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}