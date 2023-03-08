import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';
import { MediaItemModule } from './media-item/media-item.module';
import { PlaylistModule } from './playlist/playlist.module';
import { YoutubeModule } from './youtube/youtube.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`env.${process.env.NODE_ENV}.env`],
            expandVariables: true,
        }),
        UserModule,
        TokenModule,
        MediaItemModule,
        PlaylistModule,
        YoutubeModule,
        GoogleDriveModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule { }
