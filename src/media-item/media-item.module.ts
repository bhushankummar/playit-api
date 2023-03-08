import { Module } from '@nestjs/common';
import { MediaItemController } from './media-item.controller';
import { MediaItemService } from './media-item.service';

@Module({
    controllers: [MediaItemController],
    providers: [MediaItemService]
})
export class MediaItemModule { }
