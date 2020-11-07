import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn, Timestamp, Index } from 'typeorm';
import moment = require('moment');

class User {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    email?: string;
}

@Entity('playlists')
@Index(['user._id', 'urlId', 'type'], { unique: true })
export class PlaylistEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column(type => User)
    user: User;

    @Column()
    url: string;

    @Column()
    title: string;

    @Column()
    urlId: string;

    @Column()
    type: string;

    @Column()
    driveFolderId: string;

    @Column({
        default: moment().toISOString()
    })
    lastSyncTimeStamp: Date;

    @Column({
        default: moment().toISOString()
    })
    lastUploadTimeStamp: Date;

    @CreateDateColumn()
    createdDate: string;

    @UpdateDateColumn()
    updatedDate: string;
}