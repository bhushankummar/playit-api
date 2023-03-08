import { Test, TestingModule } from '@nestjs/testing';
import { MediaItemController } from './media-item.controller';

describe('MediaItemController', () => {
    let controller: MediaItemController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MediaItemController],
        }).compile();

        controller = module.get<MediaItemController>(MediaItemController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
