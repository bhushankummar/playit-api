import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn, Unique, Index } from 'typeorm';
import moment = require('moment');

class User {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ nullable: false })
    email: string;
}

export class MediaError {
    @Column({ nullable: false })
    downloadOptions: number;

    @Column({ nullable: false })
    message: string;
}

@Entity('mediaItems')
@Index(['user._id', 'playlistId', 'urlId'], { unique: true })
export class MediaItemEntity {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column(type => User)
    user: User;

    @Column({ nullable: false })
    url: string;

    @Column({ nullable: false })
    @Column()
    title: string;

    @Column({ nullable: false })
    @Column()
    urlId: string;

    @Column({ nullable: false })
    playlistId: string;

    @Column({ nullable: false })
    driveFolderId: string;

    @Column()
    fileId: string;

    @Column({ default: false })
    isUploaded: boolean;

    @Column({ default: false })
    isDownloaded: boolean;

    @Column({ default: 0 })
    downloadAttemptCount: number;

    @Column()
    lastDownloadTimeStamp: Date;

    @Column()
    lastUploadTimeStamp: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date;

    @Column((type => MediaError))
    errors: MediaError[];

    @Column()
    localFilePath: string;
}