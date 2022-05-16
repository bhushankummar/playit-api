import _ = require('lodash');
import { YOUTUBE } from '../constants';
import { MediaItemEntity } from '../entities/MediaItemEntity';
// import { IYtplItem } from '../interface/IYtplItem';
// import * as Debug from 'debug';

// const debug = Debug('PL:YtplUtils');

export const prepareFileName = (item: Partial<MediaItemEntity>,
  options = {
    extension: '',
    isAddExtension: false,
    isAddUrlId: false,
  }
  // extension = '',
  // isAddExtension = false,
  // isAddUrlId = false
) => {
  let fileName = cleanFileName(item.title);
  let youtubeId = item.urlId;
  if (_.isEmpty(youtubeId)) {
    youtubeId = item.urlId;
  }
  if (options.isAddUrlId === true) {
    if (youtubeId) {
      fileName = fileName.concat(YOUTUBE.ID_SEPARATOR, youtubeId);
    }
  }
  if (options.isAddExtension === true) {
    fileName = fileName.concat('.', options.extension);
  }
  return fileName;
};

export const prepareFolderName = (folderName: string) => {
  const cleanFolderName = cleanFileName(folderName, false);
  return cleanFolderName;
};

export const cleanFileName = (fileName: string, isFile = true) => {
  const cleanWords = [
    'HD',
    'lyrical:',
    'Lyrical :',
    'Lyrical:',
    'Lyrical Video:',
    'Lyrical',
    'Best Lyric Video',
    'Best Video',
    'Official:',
    '(Full Song)',
    '[Full Song]',
    'Full Song',
    'Full Song:',
    'Full Audio:',
    'Full Video HD',
    'Full Video',
    'Full Video:',
    'Full Video Song',
    'Full HD Song',
    'Full Video HD',
    'Full Video',
    '[Official Video]',
    '(Official Song)',
    '(Official Video)',
    '(Video Song)',
    'Video',
    'VIDEO',
    '/r',
    '/',
    '\\',
    '//',
    '"',
    '_',
    '#',
    '[]',
    '()',
    '*',
    '?',
    '<',
    '>',
    '( )', //Should be last,
    ' - - '
  ];
  // fileName = fileName.split(/'/g).join(' ');
  cleanWords.forEach((word: string) => {
    fileName = fileName.split(word).join('');
    fileName = fileName.split(word.toLowerCase()).join(''); // Lowercase
    fileName = fileName.split(word.toUpperCase()).join(''); // Uppercase
    fileName = fileName.trim();
  });
  fileName = fileName.replace(/\|/g, '-'); // Replace |
  fileName = fileName.replace(/:/g, '-'); // Replace :
  fileName = fileName.replace(/'/g, '');
  fileName = fileName.replace(/- -/g, '');
  fileName = fileName.toString().replace(/"/g, '\\"');
  fileName = fileName.replace(/\/\//g, '');
  fileName = fileName.replace(/\s\s+/g, ' ');
  fileName = fileName.replace(/ +(?= )/g, '');
  if (isFile === true) {
    fileName = fileName.replace('-', '');
  }
  cleanWords.forEach((word: string) => {
    fileName = fileName.split(word).join('');
    fileName = fileName.split(word.toLowerCase()).join(''); // Lowercase
    fileName = fileName.split(word.toUpperCase()).join(''); // Uppercase
    fileName = fileName.trim();
  });
  return fileName;
};
