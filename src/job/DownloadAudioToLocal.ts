import * as Debug from 'debug';
import * as cron from 'cron';
import { CRONE_JOB, DOWNLOAD_AUDIO_SCHEDULE, ENDPOINT } from '../constants';
import * as request from 'request-promise';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-DownloadAudioToLocal');

export const init: any = () => {
  const croneTime = `${DOWNLOAD_AUDIO_SCHEDULE.Seconds  } ${ 
    DOWNLOAD_AUDIO_SCHEDULE.Minutes  } ${ 
    DOWNLOAD_AUDIO_SCHEDULE.Hours  } ${ 
    DOWNLOAD_AUDIO_SCHEDULE.DayOfMonth  } ${ 
    DOWNLOAD_AUDIO_SCHEDULE.Months  } ${ 
    DOWNLOAD_AUDIO_SCHEDULE.DayOfWeek}`;
  const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
  debug('.............. DownloadAudioToLocal Job Initiated Successfully, still you have to execute start() ........');
  return job;
};

let taskRunning = false;
const start: any = async () => {
  if (taskRunning) {
    debug('.............. SKIP ........');
    return;
  }
  taskRunning = true;
  // debug('.............. Start ........');
  try {
    const options = {
      method: 'POST',
      uri: `${ENDPOINT.DOWNLOAD}`,
      body: {},
      json: true
    };
    await request(options);
  } catch (error) {
    // debug('error ', error);
  }
  taskRunning = false;
};
