import * as chai from 'chai';
import * as _ from 'lodash';
import { playlistItems } from '../../test/mock/YouTube';
import * as YtplUtils from './YtplUtils';
import * as Debug from 'debug';

const debug = Debug('PL:YouTube.spec');

chai.should();

describe('YouTube', () => {

    it('File name should not have special characters.', (done) => {
        const items = _.sortBy(playlistItems, 'title');
        let cleanFileNames = [];
        items.forEach((value) => {
            const fileName = YtplUtils.prepareFileName(value, 'mp3');
            // debug('fileName  ', fileName);
            cleanFileNames.push(fileName);
        });
        cleanFileNames = _.sortBy(cleanFileNames);
        debug(cleanFileNames.join('\n'));
        done();
    });

});