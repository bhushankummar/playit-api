import { Column, Entity, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectID } from 'mongodb'

class User {
    @ObjectIdColumn()
    public _id: ObjectID;
}

@Entity('tokens')
export class TokenEntity {

    @ObjectIdColumn()
    public _id: ObjectID;

    @Column()
    public token: string;

    @Column()
    public timestamp: Date;

    @Column(type => User)
    public user: User;

    @CreateDateColumn()
    public createdDate: string;

    @UpdateDateColumn()
    public updatedDate: string;
}
