import { YOUTUBE } from '../constants';
import * as _ from 'lodash';
// import * as Debug from 'debug';

// const debug = Debug('PL:YtplUtils');

export const prepareFileName = (item: any, extension: string, isAddExtension = false) => {
  let fileName = cleanFileName(item.title);
  let youtubeId = item.urlId;
  if (_.isEmpty(youtubeId)) {
    youtubeId = item.id;
  }
  if (isAddExtension === true) {
    fileName = fileName.concat(YOUTUBE.ID_SEPARATOR, youtubeId, '.', extension);
  }
  return fileName;
};

export const cleanFileName = (fileName: string) => {
  const cleanWords = [
    '/r',
    '/',
    '\\',
    '"',
    '_',
    'lyrical:',
    'Lyrical :',
    'Lyrical:',
    'Full Song:',
    'Full Audio:',
    'Lyrical Video:',
    'Official:',
    'Full Video:',
    '#',
    '(Full Song)',
    '[Full Song]',
    'Full Song',
    '(Official Song)',
    '(Official Video)',
    'Full Video Song'
  ];
  // fileName = fileName.split(/'/g).join(' ');
  cleanWords.forEach((word: string) => {
    fileName = fileName.split(word).join(' ');
    fileName = fileName.split(word.toLowerCase()).join(' '); // Lowercase
    fileName = fileName.split(word.toUpperCase()).join(' '); // Uppercase
    fileName = fileName.trim();
  });
  fileName = fileName.replace(/\|/g, ' - ');
  fileName = fileName.replace(/:/g, ' - ');
  fileName = fileName.toString().replace(/"/g, '\\"');
  fileName = fileName.replace(/\/\//g, '');
  fileName = fileName.replace(/\s\s+/g, ' ');
  fileName = fileName.replace(/ +(?= )/g, '');
  return fileName;
};
