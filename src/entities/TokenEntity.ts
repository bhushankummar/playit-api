import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

class User {
    @ObjectIdColumn()
    _id: ObjectID;
}

@Entity('tokens')
export class TokenEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    token: string;

    @Column()
    timestamp: Date;

    @Column(type => User)
    user: User;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
