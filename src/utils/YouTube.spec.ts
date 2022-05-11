import * as chai from 'chai';
import * as _ from 'lodash';
import { playlistItems } from '../../test/mock/YouTube';
import * as YtplUtils from './YtplUtils';
import * as Debug from 'debug';
import { IYtplItem } from '../interface/IYtplItem';

const debug = Debug('PL:YouTube.spec');

chai.should();

describe('YouTube', () => {

  it('File name should not have special characters.', (done) => {
    // debug('Inside File name should not have special characters.');
    const items = _.sortBy(playlistItems, 'title');
    let cleanFileNames = [];
    const cleanFileNamesWithoutFlag = [];
    items.forEach((value: Partial<IYtplItem>) => {
      const fileName = YtplUtils.prepareFileName(value, 'mp3', true);
      const fileNameWithoutFlag = YtplUtils.prepareFileName(value, 'mp3', false);
      // debug('fileName  ', fileName);
      cleanFileNames.push(fileName);
      cleanFileNamesWithoutFlag.push(fileNameWithoutFlag);
    });
    cleanFileNames = _.sortBy(cleanFileNames);
    debug(cleanFileNames.join('\n'));

    cleanFileNames = _.sortBy(cleanFileNamesWithoutFlag);
    debug(cleanFileNames.join('\n'));
    done();
  });

});