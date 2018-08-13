const path = require('path');
require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

const testUtility = require('./utils/utility.js');
const documents = require('./utils/documents.js');

const nock = require('nock');

describe('ATTACHMENTS APIs', function () {

    afterEach('after each test', function (done) {
        nock.cleanAll();
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

    it('POST attachment to not existent doc', function (done) {
        server
            .post(`/api/favorites/attach?id=TEST2&name=frog&value=web`)
            .attach('files', path.join(process.cwd(), 'test', 'utils', 'Frog_Capture.png'))
            .expect(200)
            .then((res) => {
                res.body.should.not.be.empty();
                res.body.should.be.a.Object();
                res.body.should.have.a.property('id', 'TEST2');
                res.body.should.have.a.property('name', 'frog');
                res.body.should.have.a.property('value', 'web');
                res.body.should.have.a.property('attachments');
                res.body.attachments.should.be.a.Array();
                res.body.attachments.length.should.be.eql(1);
                return done();
            }).catch(done);

    });

    it('GET attachment from existent document', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return testUtility.addAttachmentToCloudant(documents.testDoc._id,
                path.join(process.cwd(), 'test', 'utils', 'Frog_Capture.png'), 'Frog_Capture.png', 'image/png');
        }).then(() => {
            return server
                .get(`/api/favorites/attach?id=${documents.testDoc._id}&key=Frog_Capture.png`)
                .set('Accept', 'application/json')
                .expect('Content-Disposition', 'inline; filename=\'Frog_Capture.png\'')
                .expect(200);
        }).then(() => {
            return done();
        }).catch(done);
    });

    it('GET attachment from existent document', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return testUtility.addAttachmentToCloudant(documents.testDoc._id,
                path.join(process.cwd(), 'test', 'utils', 'Frog_Capture.png'), 'Frog_Capture.png', 'image/png');
        }).then(() => {
            nock('http://admin:pass@localhost:8080')
                .get(/.*/)
                .delay(20)
                .reply(500);

            return server
                .get(`/api/favorites/attach?id=${documents.testDoc._id}&key=Frog_Capture.png`)
                .set('Accept', 'application/json')
                .expect(500);
        }).then(() => {
            return done();
        }).catch(done);
    });


});
