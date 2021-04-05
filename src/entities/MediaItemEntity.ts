import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn, Index, PrimaryGeneratedColumn } from 'typeorm';


class User {

    @ObjectIdColumn()
    public id: string;

    @Column({ nullable: false })
    public email: string;
}

class Playlist {
    @ObjectIdColumn()
    public id: string;

    @Column()
    public title?: string;
}

export class MediaError {
    @Column({ nullable: false })
    public downloadOptions: number;

    @Column({ nullable: false })
    public message: string;
}

@Entity('mediaItems')
@Index(['user.id', 'playlistUrlId', 'driveFolderId', 'urlId'], { unique: true })
export class MediaItemEntity {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column(type => User)
    public user: User;

    @Column({ nullable: false })
    public url: string;

    @Column({ nullable: false })
    public title: string;

    @Column({ nullable: false })
    public urlId: string;

    @Column({ nullable: false })
    public playlistUrlId: string;

    @Column(type => Playlist)
    public playlist: Playlist;

    @Column({ nullable: false })
    public type: string;

    @Column({ nullable: false })
    public driveFolderId: string;

    @Column()
    public fileId: string;

    @Column({ default: false })
    public isUploaded: boolean;

    @Column({ default: false })
    public isDownloaded: boolean;

    @Column({ default: 0 })
    public downloadAttemptCount = 0;

    @Column({ default: 0 })
    public googleDriveUploadAttemptCount = 0;

    @Column()
    public lastDownloadTimeStamp: Date;

    @Column()
    public lastUploadTimeStamp: Date;

    @Column()
    public errors: MediaError[];

    @Column()
    public localFilePath: string;

    @CreateDateColumn()
    public createdDate: string;

    @UpdateDateColumn()
    public updatedDate: string;
}