import { Column, Entity, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, Index, PrimaryGeneratedColumn } from 'typeorm';


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

    @PrimaryGeneratedColumn('uuid')
    public id: string;

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