'use strict'

const Net = require('./net')

const DEFAULT_OPTIONS = {
  stream: false, // set true to use streams instead of promises
  expiry: 60 * 60 * 24 * 1, // 1 day, time interval in seconds
  maxConnections: 10, // max connections per server
  connectionTimeout: 1000, // connection timeout in milliseconds
  timeout: 500, // request timeout in milliseconds
  retries: 2, // request retries - max retries
  retriesDelay: 100, // request retries - initial delay
  retriesFactor: 2 // request retries - exponential factor
}

class Client {
  constructor (servers, options = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options }
    this._net = new Net(servers, this._options)
    this._opaque = 0
  }

  static _opaque = 0

  static opaque () {
    Client._opaque = ++Client._opaque % 0xffffffff
    return Client._opaque
  }

  static get (key) {
    return ['get', key, Client.opaque()]
  }

  static getk (key) {
    return ['getk', key, Client.opaque()]
  }

  static set (key, value, expiry) {
    return ['set', key, value, expiry, Client.opaque()]
  }

  static del (key) {
    return ['del', key, Client.opaque()]
  }

  static flush (expiry) {
    return ['flush', expiry, Client.opaque()]
  }

  get (key) {
    return this._net.query(Client.get(key))
  }

  getk (key) {
    return this._net.query(Client.getk(key))
  }

  set (key, value, expiry) {
    return this._net.query(Client.set(key, value, expiry || this._options.expiry))
  }

  del (key) {
    return this._net.query(Client.del(key))
  }

  flush (expiry) {
    return this._net.query(Client.flush(expiry))
  }

  stream () {
    return this._net.query()
  }

  end () {
    this._net.end()
  }
}

module.exports = Client
