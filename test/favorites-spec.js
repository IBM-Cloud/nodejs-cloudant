require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

describe('FAVORITES APIs', function () {

    it('GET favorites with no document', function (done) {
        server
            .get('/api/favorites')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.be.empty();
                return done();
            });
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
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.be.empty();
                return done();
            });
    });

    it('PUT favorites', function (done) {
        server
            .get('/api/favorites')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.be.not.empty();
                res.body.should.be.a.Array();
                res.body.length.should.be.eql(1);
                res.body[0].should.have.a.property('id');
                res.body[0].should.have.a.property('name', 'bar');
                res.body[0].should.have.a.property('value', 'foo');
                const id = res.body[0].id;
                server
                    .put('/api/favorites')
                    .set('Accept', 'application/json')
                    .send({
                        id: id,
                        name: 'bar',
                        value: 'frog'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        res.body.should.be.empty();
                        return done();
                    });
            });
    });

});
