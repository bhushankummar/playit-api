import { Request } from 'express';
import { UserEntity } from '../entities/UserEntity';
import { TokenEntity } from '../entities/TokenEntity';
import { PlaylistEntity } from '../entities/PlaylistEntity';
import { MediaItemEntity } from '../entities/MediaItemEntity';
import { IGoogleDriveFileStore } from './IGoogleDriveFileStore';
import { IYtplPlaylist } from './IYtplPlaylist';

export interface IRequest extends Request {
    data: any;
    localMediaStore: any;
    userStore: UserEntity;
    tokenStore: TokenEntity;
    playlistStore: PlaylistEntity;
    playlistItemStore: PlaylistEntity[];
    youTubeStore: any;
    youTubePlaylistStore: Partial<IYtplPlaylist>;
    googleStore: any;
    mediaStore: MediaItemEntity;
    mediaItemsStore: MediaItemEntity[];
    googleProfileStore: any;
    googleDriveFileStore: IGoogleDriveFileStore;
    googleDriveFileItemsStore: IGoogleDriveFileStore[];
    googleDriveStore: any;
    googleDriveItemsStore: any;
}
