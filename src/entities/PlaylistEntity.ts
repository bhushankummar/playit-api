import { Column, CreateDateColumn, Entity,  UpdateDateColumn, Index, PrimaryGeneratedColumn } from 'typeorm';
import moment = require('moment');
import { BaseEntity } from './BaseEntity';

@Entity('playlists')
@Index(['user.id', 'urlId', 'type'], { unique: true })
export class PlaylistEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('uuid')
  public userId: string;

  @Column()
  public url: string;

  @Column()
  public title: string;

  @Column()
  public urlId: string;

  @Column()
  public type: string;

  @Column()
  public driveFolderId: string;

  @Column({
    default: moment().toISOString()
  })
  public lastSyncTimeStamp: Date;

  @Column({
    default: moment().toISOString()
  })
  public lastUploadTimeStamp: Date;
}