import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';

@Module({
    controllers: [PlaylistController],
    providers: [PlaylistService]
})
export class PlaylistModule { }
