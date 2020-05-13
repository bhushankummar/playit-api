import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

class User {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ nullable: false })
    email: string;
}

@Entity('mediaItems')
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

    @CreateDateColumn()
    createdDate: string;

    @UpdateDateColumn()
    updatedDate: string;
}