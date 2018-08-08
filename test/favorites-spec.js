require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

const testUtility = require('./utils/utility.js');
const documents = require('./utils/documents.js');

describe('FAVORITES APIs', function () {

    afterEach('after each test', function (done) {
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

    it('GET favorites with one document', function (done) {
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

});
