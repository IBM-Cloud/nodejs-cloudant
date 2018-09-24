const path = require('path');
require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

const testUtility = require('./utils/utility.js');
const documents = require('./utils/documents.js');

describe('ATTACHMENTS APIs', function () {

    afterEach('after each test', function (done) {
        testUtility.deleteAllFromCloudant().then(() => {
            return done()
        }).catch(done);
    });

    it('POST attachment to existent doc', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return server
                .post(`/api/favorites/attach?id=${documents.testDoc._id}&name=${documents.testDoc.name}&value=${documents.testDoc.value}`)
                .attach('files', path.join(process.cwd(), 'test', 'utils', 'Frog_Capture.png'))
                .expect(200);
        }).then((res) => {
            res.body.should.not.be.empty();
            res.body.should.be.a.Object();
            res.body.should.have.a.property('id', documents.testDoc._id);
            res.body.should.have.a.property('name', documents.testDoc.name);
            res.body.should.have.a.property('value', documents.testDoc.value);
            res.body.should.have.a.property('attachments');
            res.body.attachments.should.be.a.Array();
            res.body.attachments.length.should.be.eql(1);
            return done();
        }).catch(done);

    });

});
