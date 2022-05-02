'use strict';

const EventEmitter = require('events');

class FakeChildProcess extends EventEmitter {
  constructor() {
    super();
    this.stdoutCallbacks = {
      data: [],
      end: [],
    };
    this.stderrCallbacks = {
      data: [],
    };
    this.stdout = {
      on: (event, callback) => {
        this.stdoutCallbacks[event].push(callback);
      },
    };
    this.stderr = {
      on: (event, callback) => {
        this.stderrCallbacks[event].push(callback);
      },
    };
  }

  emitMessage(message) {
    this.emit('message', message);
  }

  emitStdout(event, data) {
    this.stdoutCallbacks[event].forEach((callback) => {
      callback(data);
    });
  }

  emitStderr(event, data) {
    this.stderrCallbacks[event].forEach((callback) => {
      callback(data);
    });
  }
}

module.exports = FakeChildProcess;
