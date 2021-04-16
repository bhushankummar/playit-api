import { Column, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('tokens')
export class TokenEntity extends BaseEntity {

    @Column()
    public token: string;

    @Column()
    public timestamp: Date;

    @Column('uuid')
    public userId: string;

    @CreateDateColumn()
    public createdDate: string;

    @UpdateDateColumn()
    public updatedDate: string;
}
