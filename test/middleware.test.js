var express = require('express');
var should = require('should');
var request = require('supertest');
var Q = require('q');

var responses = { 
  json: {
    happy: { happy: true },
    sad: { sad: true },
    normal: { normal: true }
  },
  jsonp: {
    happy: { yes: true },
    sad: { no: true },
    normal: { normal: true }
  }
};

function createApp() {
  var app = express();

  app.use(require('../lib/middleware')());
  app.get('/json/happy', function (req, res) {
    res.json(Q(responses.json.happy));
  });
  app.get('/json/sad', function (req, res) {
    res.json(Q.reject(responses.json.sad));
  });
  app.get('/json/normal', function (req, res) {
    res.json(responses.json.normal);
  });
  app.get('/jsonp/happy', function (req, res) {
    app.set('jsonp callback name', 'cb');
    res.jsonp(Q(responses.jsonp.happy));
  });
  app.get('/jsonp/sad', function (req, res) {
    app.set('jsonp callback name', 'cb');
    res.jsonp(Q.reject(responses.jsonp.sad));
  });
  app.get('/jsonp/normal', function (req, res) {
    app.set('jsonp callback name', 'cb');
    res.jsonp(responses.jsonp.normal);
  });

  app.use(function error_handling_middleware(err, req, res, next) {
    res.status(501);
    res.json({ error: err });
  });

  return app;
}

describe('express-json-promise', function () {
  var app;

  beforeEach(function () {
    app = createApp();
  });
  describe('json', function () {
    describe('promise resolved response', function () {
      it('should return the happy response', function (done) {
        request(app)
          .get('/json/happy')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            should(res.body).eql(responses.json.happy);
            done();
          });
      });
    });

    describe('promise rejected response', function () {
      it('should return the sad response with a 500 status', function (done) {
        request(app)
          .get('/json/sad')
          .expect('Content-Type', /json/)
          .expect(501)
          .end(function (err, res) {
            if (err) throw err;
            should(res.body).eql({ error: responses.json.sad });
            done();
          });
      });
    });

    describe('non-promise response', function () {
      it('should return the response immediately as per normal', function (done) {
        request(app)
          .get('/json/normal')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            should(res.body).eql(responses.json.normal);
            done();
          });
      });
    });
  });
  describe('jsonp', function () {
    describe('promise resolved response', function () {
      it('should return the happy response', function (done) {
        request(app)
          .get('/jsonp/happy?cb=myCallback')
          .expect('Content-Type', /javascript/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            should(res.text).eql('/**/ typeof myCallback === \'function\' && myCallback(' + JSON.stringify(responses.jsonp.happy) + ');');
            done();
          });
      });
    });

    describe('promise rejected response', function () {
      it('should return the sad response with a 500 status', function (done) {
        request(app)
          .get('/jsonp/sad?cb=myCallback')
          .expect('Content-Type', /json/)
          .expect(501)
          .end(function (err, res) {
            if (err) throw err;
            should(res.body).eql({ error: responses.jsonp.sad });
            done();
          });
      });
    });

    describe('non-promise response', function () {
      it('should return the response immediately as per normal', function (done) {
        request(app)
          .get('/jsonp/normal?cb=myCallback')
          .expect('Content-Type', /javascript/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            should(res.text).eql('/**/ typeof myCallback === \'function\' && myCallback(' + JSON.stringify(responses.jsonp.normal) + ');');
            done();
          });
      });
    });
  });
});