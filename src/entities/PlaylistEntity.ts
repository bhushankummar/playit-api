import {Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn} from 'typeorm';

class User {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    email?: string;
}

@Entity('playlist')
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

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}