import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn, Unique, Index } from 'typeorm';
import moment = require('moment');

class User {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ nullable: false })
    email: string;
}

class Playlist {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    title?: string;
}

export class MediaError {
    @Column({ nullable: false })
    downloadOptions: number;

    @Column({ nullable: false })
    message: string;
}

@Entity('mediaItems')
@Index(['user._id', 'playlistUrlId', 'urlId'], { unique: true })
export class MediaItemEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column(type => User)
    user: User;

    @Column({ nullable: false })
    url: string;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    @Column()
    urlId: string;

    @Column({ nullable: false })
    playlistUrlId: string;

    @Column(type => Playlist)
    playlist: Playlist;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false })
    driveFolderId: string;

    @Column()
    fileId: string;

    @Column({ default: false })
    isUploaded: boolean;

    @Column({ default: false })
    isDownloaded: boolean;

    @Column({ default: 0 })
    downloadAttemptCount: number = 0;

    @Column()
    lastDownloadTimeStamp: Date;

    @Column()
    lastUploadTimeStamp: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date;

    @Column()
    errors: object[];

    @Column()
    localFilePath: string;
}