import * as DownloadAudioToLocal from './DownloadAudioToLocal';
import * as UploadAudioToGoogleDrive from './UploadAudioToGoogleDrive';
import * as SyncMediaItemWithYouTube from './SyncMediaItemWithYouTube';
import * as SyncGoogleDriveFolder from './SyncGoogleDriveFolder';
import { CRONE_JOB, DOWNLOAD_AUDIO_SCHEDULE, UPLOAD_AUDIO_SCHEDULE, SYNC_TO_YOUTUBE_SCHEDULE } from '../constants';
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
  if (DOWNLOAD_AUDIO_SCHEDULE.ACTION === true) {
    const downloadAudioToLocalJob = DownloadAudioToLocal.init();
    downloadAudioToLocalJob.start();
  }

  if (UPLOAD_AUDIO_SCHEDULE.ACTION === true) {
    UploadAudioToGoogleDrive.init().start();
  }
  if (SYNC_TO_YOUTUBE_SCHEDULE.ACTION === true) {
    const syncMediaItemWithYouTubeJob = SyncMediaItemWithYouTube.init();
    syncMediaItemWithYouTubeJob.start();
  }
  if (SYNC_TO_YOUTUBE_SCHEDULE.ACTION === true) {
    const syncGoogleDriveFolderJob = SyncGoogleDriveFolder.init();
    syncGoogleDriveFolderJob.start();
  }
};
