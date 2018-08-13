const path = require('path');
require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

const testUtility = require('./utils/utility.js');
const documents = require('./utils/documents.js');

const nock = require('nock');

describe('FAVORITES APIs', function () {

    afterEach('after each test', function (done) {
        nock.cleanAll();
        testUtility.deleteAllFromCloudant().then(() => {
            return done()
        }).catch(done);
    });

    it('GET favorites with no document', function (done) {
        server
            .get('/api/favorites')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then((res) => {
                res.body.should.be.empty();
                return done();
            })
            .catch(done);
    });

    it('GET favorites with one document with no attachment', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return server
                .get('/api/favorites')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);
        }).then((res) => {
            res.body.should.not.be.empty();
            res.body.should.be.a.Array();
            res.body.length.should.be.eql(1);
            res.body[0].should.have.a.property('id', documents.testDoc._id);
            res.body[0].should.have.a.property('name', documents.testDoc.name);
            res.body[0].should.have.a.property('value', documents.testDoc.value);
            res.body[0].should.have.a.property('attachments');
            res.body[0].attachments.should.be.a.Array();
            res.body[0].attachments.length.should.be.eql(0);
            return done();
        }).catch(done);
    });

    it('GET favorites with one document with one attachment', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return testUtility.addAttachmentToCloudant(documents.testDoc._id,
                path.join(process.cwd(), 'test', 'utils', 'Frog_Capture.png'), 'Frog_Capture.png', 'image/png');
        }).then(() => {
            return server
                .get('/api/favorites')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);
        }).then((res) => {
            res.body.should.not.be.empty();
            res.body.should.be.a.Array();
            res.body.length.should.be.eql(1);
            res.body[0].should.have.a.property('id', documents.testDoc._id);
            res.body[0].should.have.a.property('name', documents.testDoc.name);
            res.body[0].should.have.a.property('value', documents.testDoc.value);
            res.body[0].should.have.a.property('attachments');
            res.body[0].attachments.should.be.a.Array();
            res.body[0].attachments.length.should.be.eql(1);
            return done();
        }).catch(done);
    });


    it('GET favorites with database down', function (done) {
        nock('http://admin:pass@localhost:8080')
            .get('/my_sample_db/_all_docs')
            .delay(20)
            .reply(500);

        server
            .get('/api/favorites')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(500)
            .then((res) => {
                res.body.should.be.not.empty();
                res.body.message.should.be.eql('500 null');
                return done();
            })
            .catch(done);
    });

    it('POST favorites', function (done) {
        server
            .post('/api/favorites')
            .set('Accept', 'application/json')
            .send({
                name: 'bar',
                value: 'foo'
            })
            .expect(201)
            .then((res) => {
                res.body.should.not.be.empty();
                res.body.should.be.a.Object();
                res.body.should.have.a.property('id');
                const id = res.body.id;
                return testUtility.getFromCloudant(id);
            })
            .then((doc) => {
                doc.should.have.a.property('name', 'bar');
                doc.should.have.a.property('value', 'foo');
                return done();
            })
            .catch(done);
    });

    it('POST favorites with database down', function (done) {
        nock('http://admin:pass@localhost:8080')
            .post(/.*/)
            .delay(20)
            .reply(500);

        server
            .post('/api/favorites')
            .set('Accept', 'application/json')
            .send({
                name: 'bar',
                value: 'foo'
            })
            .expect(500)
            .then((res) => {
                res.body.should.be.not.empty();
                res.body.message.should.be.eql('500 null');
                return done();
            })
            .catch(done);
    });

    it('PUT favorites', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return server
                .put('/api/favorites')
                .set('Accept', 'application/json')
                .send({
                    id: documents.testDoc._id,
                    name: documents.testDoc.name,
                    value: 'frog'
                })
                .expect(200);
        }).then((res) => {
            res.body.should.be.empty();
            return testUtility.getFromCloudant(documents.testDoc._id);
        }).then((doc) => {
            doc.should.have.a.property('name', documents.testDoc.name);
            doc.should.have.a.property('value', 'frog');
            return done();
        }).catch(done);
    });

    it('PUT favorites with database down', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            nock('http://admin:pass@localhost:8080')
                .post(/.*/)
                .delay(20)
                .reply(500)
                .get(/.*/)
                .delay(20)
                .reply(500);

            return server
                .put('/api/favorites')
                .set('Accept', 'application/json')
                .send({
                    id: documents.testDoc._id,
                    name: documents.testDoc.name,
                    value: 'frog'
                })
                .expect(500);
        }).then((res) => {
            res.body.should.be.not.empty();
            res.body.message.should.be.eql('500 null');
            return done();
        }).catch(done);
    });

    it('DELETE favorites', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            return server
                .delete('/api/favorites?id=' + documents.testDoc._id)
                .set('Accept', 'application/json')
                .expect(200);
        }).then((res) => {
            res.body.should.be.empty();
            return done();
        }).catch(done);
    });

    it('DELETE favorites with database down', function (done) {
        testUtility.putOnCloudant(documents.testDoc).then(() => {
            nock('http://admin:pass@localhost:8080')
                .post(/.*/)
                .delay(20)
                .reply(500)
                .get(/.*/)
                .delay(20)
                .reply(500);


            return server
                .delete('/api/favorites?id=' + documents.testDoc._id)
                .set('Accept', 'application/json')
                .expect(500);
        }).then((res) => {
            res.body.should.be.not.empty();
            res.body.message.should.be.eql('500 null');
            return done();
        }).catch(done);
    });

});
