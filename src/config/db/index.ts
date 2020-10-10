import * as Debug from 'debug';
import * as mongoose from 'mongoose';
import { Connection, createConnection } from 'typeorm';
import { UserEntity } from '../../entities/UserEntity';
import { TokenEntity } from '../../entities/TokenEntity';
import { DB } from '../../constants';
import { PlaylistEntity } from '../../entities/PlaylistEntity';
import { MediaItemEntity } from '../../entities/MediaItemEntity';

const debug = Debug('PL:DB');

export const init = async () => {
    const connection: Connection = await createConnection({
        type: 'mongodb',
        url: DB.MONGO_URL,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        entities: [
            MediaItemEntity,
            PlaylistEntity,
            UserEntity,
            TokenEntity
        ]
    });
    return connection;
};

export const initMongo = async () => {
    return mongoose.connect(DB.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};