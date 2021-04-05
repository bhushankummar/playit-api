import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import { UserEntity } from '../../entities/UserEntity';
import { TokenEntity } from '../../entities/TokenEntity';
import { DB } from '../../constants';
import { PlaylistEntity } from '../../entities/PlaylistEntity';
import { MediaItemEntity } from '../../entities/MediaItemEntity';

// const debug = Debug('PL:DB');

export const init = async () => {
  const options: ConnectionOptions = {
    type: 'mysql',
    url: DB.DATABASE_URL,
    synchronize: true,
    entities: [
      MediaItemEntity,
      PlaylistEntity,
      UserEntity,
      TokenEntity
    ]
  }
  const connection: Connection = await createConnection(options);
  return connection;
};
