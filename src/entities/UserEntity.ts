import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

class Google {
    @Column()
    public access_token: string;

    @Column()
    public refresh_token: string;

    @Column()
    public scope: string;

    @Column()
    public token_type: string;

    @Column()
    public id_token: string;

    @Column()
    public expiry_date: number;
}

@Entity('users')
export class UserEntity {

    @ObjectIdColumn()
    public _id: ObjectID;

    @Index({ unique: true })
    @Column()
    public email: string;

    @Column()
    public google: Google;

    @Column()
    public googleDriveParentId: string;

    @CreateDateColumn()
    public createdDate: string;

    @UpdateDateColumn()
    public updatedDate: string;
}