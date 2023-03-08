import { Test, TestingModule } from '@nestjs/testing';
import { GoogleDriveController } from './google-drive.controller';

describe('GoogleDriveController', () => {
    let controller: GoogleDriveController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GoogleDriveController],
        }).compile();

        controller = module.get<GoogleDriveController>(GoogleDriveController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
