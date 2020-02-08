import * as DownloadAudioToLocal from './DownloadAudioToLocal';
import * as DownloadVideoToLocal from './DownloadVideoToLocal';
import * as UploadAudioToGoogleDrive from './UploadAudioToGoogleDrive';
import * as UploadVideoToGoogleDrive from './UploadVideoToGoogleDrive';
import * as EmptyTrashGoogleDrive from './EmptyTrashGoogleDrive';
import * as SyncMediaItemWithYouTube from './SyncMediaItemWithYouTube';
import { CRONE_JOB } from '../constants';
import * as _ from 'lodash';
import * as Debug from 'debug';

const debug = Debug('PL:JOB-Index');
/**
 * Import all CronJobs here
 */
export const initAllJobs: any = () => {
    if (_.isEmpty(CRONE_JOB.ACTION)) {
        // debug('Return from empty ACTION');
        return;
    } else if (CRONE_JOB.ACTION !== CRONE_JOB.EXECUTE) {
        // debug('Return from non EXECUTE CRONE_JOB ACTION, current value is : ', CRONE_JOB.ACTION);
        return;
    }
    debug('Start initializing Crone Jobs');
    const downloadAudioToLocalJob = DownloadAudioToLocal.init();
    downloadAudioToLocalJob.start();

    DownloadVideoToLocal.init().start();
    UploadAudioToGoogleDrive.init().start();
    UploadVideoToGoogleDrive.init().start();
    EmptyTrashGoogleDrive.init().start();

    const syncMediaItemWithYouTubeJob = SyncMediaItemWithYouTube.init();
    syncMediaItemWithYouTubeJob.start();
    debug('syncMediaItemWithYouTubeJob ', syncMediaItemWithYouTubeJob.nextDates(1));
};
