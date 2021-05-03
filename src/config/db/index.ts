import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import Debug from 'debug';
import { UserEntity } from '../../entities/UserEntity';
import { TokenEntity } from '../../entities/TokenEntity';
import { DB } from '../../constants';
import { PlaylistEntity } from '../../entities/PlaylistEntity';
import { MediaItemEntity } from '../../entities/MediaItemEntity';

const debug = Debug('PL:DB');

export const init = async () => {
  const options: ConnectionOptions = {
    type: 'postgres',
    url: DB.DATABASE_URL,
    synchronize: true,
    entities: [
      MediaItemEntity,
      PlaylistEntity,
      UserEntity,
      TokenEntity
    ]
  }
  try {
    const connection: Connection = await createConnection(options);
    return connection;
  } catch (error) {
    debug('error ', error);
    process.exit(0);
  }
};
