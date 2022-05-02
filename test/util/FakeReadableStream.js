'use strict';
const Readable = require('stream').Readable;
class FakeReadableStream extends Readable {
  /**
   * 用于测试的可读流
   * @param texts {string[]} 测试的文本数组
   */
  constructor(texts = []) {
    super();
    this.texts = texts;
  }

  _read() {
    if (this.texts.length === 0) {
      this.push(null);
      return;
    }

    this.texts.forEach((text) => {
      this.push(text + '\n');
    });
    this.push(null);
  }
}

module.exports = FakeReadableStream;
