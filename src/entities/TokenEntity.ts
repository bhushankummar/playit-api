import { Column, Entity, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Generated } from 'typeorm';


class User {
    @ObjectIdColumn()
    public id: string;
}

@Entity('tokens')
export class TokenEntity {

    @Column()
    @Generated('uuid')
    public id: string;

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
