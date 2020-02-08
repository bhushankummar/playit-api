import {Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn} from 'typeorm';

class User {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    email?: string;
}

@Entity('mediaItems')
export class MediaItemEntity {

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
    playlistId: string;

    @Column()
    driveFolderId: string;

    @Column()
    fileId: string;

    @Column()
    isUploaded: boolean;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}