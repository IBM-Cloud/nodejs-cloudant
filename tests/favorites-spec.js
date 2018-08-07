require('should');
const supertest = require('supertest');
const server = supertest.agent(require('../app.js'));

describe('FAVORITES APIs', function () {

    before('before', function (done) {
        require('../db/db.js').initDBConnection().then(done).catch(done);
    });

    it('GET FAVORITES', function (done) {
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

});
