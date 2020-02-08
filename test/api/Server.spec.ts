import * as chai from 'chai';
import {app} from '../../src/server';
import * as request from 'supertest';

chai.should();

describe('Server', () => {

    it('It should Able to make sure Server up', (done) => {
        request(app).get('/').end((err: any, res: any) => {
            chai.expect(res.statusCode).to.be.equal(200);
            done();
        });
    });

});