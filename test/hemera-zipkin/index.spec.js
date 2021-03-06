'use strict'

const Hemera = require('../../packages/hemera'),
  HemeraZipkin = require('../../packages/hemera-zipkin'),
  Util = require('../../packages/hemera/build/util'),
  Code = require('code'),
  Sinon = require('sinon'),
  HemeraTestsuite = require('hemera-testsuite')

const expect = Code.expect

process.setMaxListeners(0);

describe('Basic', function () {

  var PORT = 6244
  var flags = ['--user', 'derek', '--pass', 'foobar']
  var authUrl = 'nats://derek:foobar@localhost:' + PORT
  var noAuthUrl = 'nats://localhost:' + PORT
  var server

  // Start up our own nats-server
  before(function (done) {
    server = HemeraTestsuite.start_server(PORT, flags, done)
  })

  // Shutdown our server after we are done
  after(function () {
    server.kill()
  })

  it('Should be able to trace', function (done) {

    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats, {
      crashOnFatal: false
    })

    hemera.use(HemeraZipkin)

    hemera.ready(() => {

      hemera.add({
        topic: 'email',
        cmd: 'send',
        a: {
          type$: 'number'
        }
      }, (resp, cb) => {

        cb()
      })

      hemera.act({
        topic: 'email',
        cmd: 'send',
        a: '1'
      }, (err, resp) => {

        expect(err).to.be.not.exists()
        hemera.close()
        done()
      })
    })
  })

})
