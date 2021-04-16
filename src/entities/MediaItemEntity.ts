import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export class MediaError {
    @Column({ nullable: false })
    public downloadOptions: number;

    @Column({ nullable: false })
    public message: string;
}

@Entity('mediaItems')
@Index(['userId', 'playlistUrlId', 'driveFolderId', 'urlId'], { unique: true })
export class MediaItemEntity extends BaseEntity {

    @Column({ nullable: false })
    public url: string;

    @Column({ nullable: false })
    public title: string;

    @Column({ nullable: false })
    public urlId: string;

    @Column({ nullable: false })
    public playlistUrlId: string;

    @Column('uuid')
    public playlistId: string;

    @Column('uuid')
    public userId: string;

    @Column({ nullable: false })
    public type: string;

    @Column({ nullable: false })
    public driveFolderId: string;

    @Column({ nullable: true })
    public fileId: string;

    @Column({ default: false })
    public isUploaded: boolean;

    @Column({ default: false })
    public isDownloaded: boolean;

    @Column({ default: 0 })
    public downloadAttemptCount: number;

    @Column({ default: 0 })
    public googleDriveUploadAttemptCount: number;

    @Column({ nullable: true })
    public lastDownloadTimeStamp: Date;

    @Column({ nullable: true })
    public lastUploadTimeStamp: Date;

    @Column({ type: 'json', nullable: true })
    public errors: MediaError[];

    @Column({ nullable: true })
    public localFilePath: string;
}