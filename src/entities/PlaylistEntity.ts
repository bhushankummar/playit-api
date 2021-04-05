import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn, Index, PrimaryGeneratedColumn } from 'typeorm';
import moment = require('moment');


class User {
  @ObjectIdColumn()
  public id: string;

  @Column()
  public email?: string;
}

@Entity('playlists')
@Index(['user.id', 'urlId', 'type'], { unique: true })
export class PlaylistEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column(type => User)
  public user: User;

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

  @CreateDateColumn()
  public createdDate: string;

  @UpdateDateColumn()
  public updatedDate: string;
}