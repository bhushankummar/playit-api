import { Test, TestingModule } from '@nestjs/testing';
import { MediaItemService } from './media-item.service';

describe('MediaItemService', () => {
    let service: MediaItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MediaItemService],
        }).compile();

        service = module.get<MediaItemService>(MediaItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
