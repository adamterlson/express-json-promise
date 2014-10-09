var express = require('express');
var should = require('should');
var request = require('supertest');
var Q = require('q');


var responses = { 
  happy: { happy: true },
  sad: { sad: true }
};

function createApp() {
  var app = express();

  app.use(require('../lib/middleware')());
  app.get('/json/happy', function (req, res) {
    res.json(Q(responses.happy));
  });
  app.get('/json/sad', function (req, res) {
    res.json(Q.reject(responses.sad));
  });

  app.use(function (err, req, res, next) {
    res.status(500);
    res.json(responses.sad);
  });

  return app;
}

describe('express-json-promise', function () {
  var app;
  beforeEach(function () {
    app = createApp();
  });

  describe('promise resolved response', function () {
    it('should return the happy response', function (done) {
      request(app)
        .get('/json/happy')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should(err).not.be.ok;
          should(res.body).eql(responses.happy);
          done();
        });
    });
  });

  describe('promise rejected response', function () {
    it('should return the sad response with a 500 status', function (done) {
      request(app)
        .get('/json/sad')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          should(res.body).eql(responses.sad);
          done();
        });
    });
  });
});