import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('users')
export class UserEntity extends BaseEntity {

    @Index({ unique: true })
    @Column()
    public email: string;

    @Column({ nullable: true })
    public googleDriveParentId: string;

    @Column({ nullable: false })
    public access_token: string;

    @Column({ nullable: false })
    public refresh_token: string;

    @Column()
    public scope: string;

    @Column()
    public token_type: string;

    @Column()
    public id_token: string;

    @Column({ type: 'bigint' })
    public expiry_date: number;

    @Column({
      type: 'boolean',
      default: false
    })
    public isGoogleSyncRequire: boolean
}