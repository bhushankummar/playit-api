import { Column, Entity, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

class User {
    @ObjectIdColumn()
    public _id: string;
}

@Entity('tokens')
export class TokenEntity {

    @ObjectIdColumn()
    public _id: string;

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
