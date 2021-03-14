import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

class Google {
    @Column()
    access_token: string;

    @Column()
    refresh_token: string;

    @Column()
    scope: string;

    @Column()
    token_type: string;

    @Column()
    id_token: string;

    @Column()
    expiry_date: number;
}

@Entity('users')
export class UserEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Index({ unique: true })
    @Column()
    email: string;

    @Column()
    google: Google;

    @Column()
    googleDriveParentId: string;

    @CreateDateColumn()
    createdDate: string;

    @UpdateDateColumn()
    updatedDate: string;
}