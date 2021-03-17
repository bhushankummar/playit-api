import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn, Index } from 'typeorm';
import moment = require('moment');

class User {
  @ObjectIdColumn()
  public _id: ObjectID;

  @Column()
  public email?: string;
}

@Entity('playlists')
@Index(['user._id', 'urlId', 'type'], { unique: true })
export class PlaylistEntity {

  @ObjectIdColumn()
  public _id: ObjectID;

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