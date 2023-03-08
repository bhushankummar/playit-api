import * as Debug from 'debug';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config(
  {
    override: true,
    path: `env.${process.env.NODE_ENV}.env`,
    // debug: true
  }
);

const debug = Debug('PL:Constant');

debug('NODE_ENV ', process.env.NODE_ENV);

export const DB = {
  DATABASE_URL: process.env.DATABASE_URL
};

export const APP = {
  API_URL: process.env.API_URL,
  FRONT_END_URL: process.env.FRONT_END_URL,
  FFPROBE_PATH: process.env.FFPROBE_PATH,
  IS_SANDBOX: false,
  DOWNLOAD_AUDIO_CONCURRENCY: 3,
  DOWNLOAD_VIDEO_CONCURRENCY: 3,
  DOWNLOAD_ATTEMPT: 2,
  DOWNLOAD_TAKE: 1
};

if (!_.isEmpty(process.env.DOWNLOAD_TAKE)) {
  try {
    APP.DOWNLOAD_TAKE = parseInt(process.env.DOWNLOAD_TAKE, 10);
  } catch (exception) {
    debug('exception ', exception);
  }
}

if (!_.isEmpty(process.env.DOWNLOAD_AUDIO_CONCURRENCY)) {
  try {
    APP.DOWNLOAD_AUDIO_CONCURRENCY = parseInt(process.env.DOWNLOAD_AUDIO_CONCURRENCY, 10);
  } catch (exception) {
    debug('exception ', exception);
  }
}

if (!_.isEmpty(process.env.DOWNLOAD_VIDEO_CONCURRENCY)) {
  try {
    APP.DOWNLOAD_VIDEO_CONCURRENCY = parseInt(process.env.DOWNLOAD_VIDEO_CONCURRENCY, 10);
  } catch (exception) {
    debug('exception ', exception);
  }
}

if (!_.isEmpty(process.env.DOWNLOAD_ATTEMPT)) {
  try {
    APP.DOWNLOAD_ATTEMPT = parseInt(process.env.DOWNLOAD_ATTEMPT, 10);
  } catch (exception) {
    debug('exception ', exception);
  }
}

if (process.env.SANDBOX === 'true') {
  APP.IS_SANDBOX = true;
}

export const ENDPOINT = {
  DOWNLOAD: `${APP.API_URL}/api/v1/youtube/crone/download`,
  UPLOAD: `${APP.API_URL}/api/v1/google-drive/crone/upload`,
  EMPTY_TRASH: `${APP.API_URL}/api/v1/google-drive/crone/empty/trash`,
  SYNC_TO_YOUTUBE: `${APP.API_URL}/api/v1/media-item/sync/crone/youtube`,
  SYNC_GOOGLE_DRIVE_FOLDER: `${APP.API_URL}/api/v1/playlist/crone/verify/drive-folder`
};

export const YOUTUBE = {
  ID_SEPARATOR: ' v='
};

export const USER_ROLES = {
  ADMIN: {
    id: '1',
    name: 'ADMIN'
  }
};

export const GOOGLE_AUTH = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URL: `${APP.API_URL}/api/v1/user/register/oauth/callback`,
  SCOPES: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/youtube'
  ]
};

export const MEDIA_DIRECTORY = {
  MEDIA: path.join(__dirname, '..', '..', 'media'),
  AUDIO: path.join(__dirname, '..', '..', 'media', 'audio'),
  VIDEO: path.join(__dirname, '..', '..', 'media', 'video'),
  THUMBNAIL: path.join(__dirname, '..', '..', 'media', 'thumbnail')
};

if (!fs.existsSync(MEDIA_DIRECTORY.MEDIA)) {
  fs.mkdirSync(MEDIA_DIRECTORY.MEDIA);
}
if (!fs.existsSync(MEDIA_DIRECTORY.AUDIO)) {
  fs.mkdirSync(MEDIA_DIRECTORY.AUDIO);
}
if (!fs.existsSync(MEDIA_DIRECTORY.VIDEO)) {
  fs.mkdirSync(MEDIA_DIRECTORY.VIDEO);
}
if (!fs.existsSync(MEDIA_DIRECTORY.THUMBNAIL)) {
  fs.mkdirSync(MEDIA_DIRECTORY.THUMBNAIL);
}

export const MEDIA_TYPE = {
  '0': 'AUDIO',
  '1': 'VIDEO',
  'AUDIO': '0',
  'VIDEO': '1'
};
export const MEDIA_EXTENSION = {
  'AUDIO': '.mp3',
  'VIDEO': '.mp4'
};

/**
 * EXECUTE | It will execute the Crone Job
 * STOP | It will never execute the Crone Job
 */
export const CRONE_JOB = {
  ACTION: process.env.CRONE_JOB_ACTION,
  EXECUTE: 'EXECUTE',
  STOP: 'STOP',
  TIMEZONE: 'Asia/Kolkata'
};

export const DOWNLOAD_AUDIO_SCHEDULE = {
  ACTION: process.env.DOWNLOAD_AUDIO_SCHEDULE_ACTION || true,
  Seconds: '',
  Minutes: '*/1',
  Hours: '*',
  DayOfMonth: '*',
  Months: '*',
  DayOfWeek: '*'
};

export const UPLOAD_AUDIO_SCHEDULE = {
  ACTION: process.env.UPLOAD_AUDIO_SCHEDULE_ACTION || true,
  Seconds: '',
  Minutes: '*/1',
  Hours: '*',
  DayOfMonth: '*',
  Months: '*',
  DayOfWeek: '*'
};

export const SYNC_TO_YOUTUBE_SCHEDULE = {
  ACTION: process.env.SYNC_TO_YOUTUBE_SCHEDULE_ACTION || true,
  Seconds: '',
  Minutes: '*/4',
  Hours: '*',
  DayOfMonth: '*',
  Months: '*',
  DayOfWeek: '*'
};

export const SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE = {
  ACTION: process.env.SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE || true,
  Seconds: '0',
  Minutes: '*/1',
  Hours: '*',
  DayOfMonth: '*',
  Months: '*'
};

export const UPLOAD_VIDEO_SCHEDULE = {
  Seconds: '*',
  Minutes: '*/1',
  Hours: '*',
  DayOfMonth: '*',
  Months: '*',
  DayOfWeek: '*'
};

export const AUDIO_DOWNLOAD_OPTIONS = {
  1: ['-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3'],
  2: ['-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3'],
  3: ['-f', 'bestaudio[ext=m4a]/worstaudio', '-x', '--audio-format', 'mp3'],
  4: ['-f', 'bestaudio[ext=m4a]/best', '-x', '--audio-format', 'mp3'],
  5: ['--format=22']
};

export const VIDEO_DOWNLOAD_OPTIONS = {
  1: ['--format=136'],
  2: ['--format=136']
};

console.log('DB.DATABASE_URL ',DB.DATABASE_URL);
if (_.isEmpty(DB.DATABASE_URL)) {
  debug('----------------------------------------------------------------------------------- ');
  debug('ERROR :  Please export DatabaseUrl : DATABASE_URL ,If exported, Ignore');
  debug('----------------------------------------------------------------------------------- ');
  process.exit(0);
}
if (_.isEmpty(APP.API_URL)) {
  debug('----------------------------------------------------------------------------------- ');
  debug('ERROR :  Please export API_URL');
  debug('----------------------------------------------------------------------------------- ');
  process.exit(0);
}