import { Test, TestingModule } from '@nestjs/testing';
import { GoogleDriveService } from './google-drive.service';

describe('GoogleDriveService', () => {
    let service: GoogleDriveService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GoogleDriveService],
        }).compile();

        service = module.get<GoogleDriveService>(GoogleDriveService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
