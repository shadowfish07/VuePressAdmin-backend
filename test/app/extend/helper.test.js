'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const sinon = require('sinon');

describe('transferToBoolean()', () => {
  it("should return true when transfer 'true'", () => {
    const result = app.mockContext().helper.transferToBoolean('true');
    assert(result === true);
  });

  it("should return false when transfer 'false'", () => {
    const result = app.mockContext().helper.transferToBoolean('false');
    assert(result === false);
  });

  it("should return false when transfer '1'", () => {
    const result = app.mockContext().helper.transferToBoolean('1');
    assert(result === true);
  });

  it("should return false when transfer '0'", () => {
    const result = app.mockContext().helper.transferToBoolean('0');
    assert(result === false);
  });

  it('should return false when transfer 1', () => {
    const result = app.mockContext().helper.transferToBoolean(1);
    assert(result === true);
  });

  it('should return false when transfer 0', () => {
    const result = app.mockContext().helper.transferToBoolean(0);
    assert(result === false);
  });

  it('should return false when transfer true', () => {
    const result = app.mockContext().helper.transferToBoolean(true);
    assert(result === true);
  });

  it('should return false when transfer false', () => {
    const result = app.mockContext().helper.transferToBoolean(false);
    assert(result === false);
  });

  it("should return false when transfer 'abc'", () => {
    assert.throws(() => app.mockContext().helper.transferToBoolean('abc'), {
      message: '不支持的字符串值',
    });
  });

  it("should return false when transfer 'null'", () => {
    const result = app.mockContext().helper.transferToBoolean(null);
    assert(result === false);
  });

  it("should return false when transfer 'undefined'", () => {
    const result = app.mockContext().helper.transferToBoolean(undefined);
    assert(result === false);
  });

  it("should return false when transfer 'NaN'", () => {
    const result = app.mockContext().helper.transferToBoolean(NaN);
    assert(result === false);
  });

  it("should return true when transfer 'Infinity'", () => {
    const result = app.mockContext().helper.transferToBoolean(Infinity);
    assert(result === true);
  });

  it("should return true when transfer '-Infinity'", () => {
    const result = app.mockContext().helper.transferToBoolean(-Infinity);
    assert(result === true);
  });

  it("should return false when transfer '0.0'", () => {
    const result = app.mockContext().helper.transferToBoolean(0.0);
    assert(result === false);
  });

  it("should return true when transfer '0.1'", () => {
    const result = app.mockContext().helper.transferToBoolean(0.1);
    assert(result === true);
  });

  it("should return true when transfer '-0.1'", () => {
    const result = app.mockContext().helper.transferToBoolean(-0.1);
    assert(result === true);
  });
});

describe('getAvailableFilePath', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should return a available file path when origin path is occupied', () => {
    const fs = require('fs');
    const documentRoot = '/fakePath/';
    const originFilename = 'fakeFilename';
    const suffix = '.md';
    sinon
      .stub(fs, 'existsSync')
      .withArgs(`${documentRoot}${originFilename}${suffix}`)
      .returns(true);

    const result = app
      .mockContext()
      .helper.getAvailableFilePath(documentRoot, originFilename, suffix);

    assert(result === `${documentRoot}${originFilename}_1${suffix}`);
  });
  it('should return origin file path when origin path is not occupied', () => {
    const fs = require('fs');
    const documentRoot = '/fakePath/';
    const originFilename = 'fakeFilename';
    const suffix = '.md';
    sinon
      .stub(fs, 'existsSync')
      .withArgs(`${documentRoot}${originFilename}${suffix}`)
      .returns(false);

    const result = app
      .mockContext()
      .helper.getAvailableFilePath(documentRoot, originFilename, suffix);

    assert(result === `${documentRoot}${originFilename}${suffix}`);
  });
  it('should return a available file path when origin path is occupied and need more counts', () => {
    const fs = require('fs');
    const documentRoot = '/fakePath/';
    const originFilename = 'fakeFilename';
    const suffix = '.md';
    const stub = sinon.stub(fs, 'existsSync');

    stub.withArgs(`${documentRoot}${originFilename}${suffix}`).returns(true);

    stub
      .withArgs(`${documentRoot}${originFilename}_1${suffix}`)
      .returns(true);

    stub
      .withArgs(`${documentRoot}${originFilename}_2${suffix}`)
      .returns(true);

    const result = app
      .mockContext()
      .helper.getAvailableFilePath(documentRoot, originFilename, suffix);

    assert(result === `${documentRoot}${originFilename}_3${suffix}`);
  });
  it('should return origin file path when documentRoot is not end with "/" and origin path is not occupied', () => {
    const fs = require('fs');
    const documentRoot = '/fakePath';
    const originFilename = 'fakeFilename';
    const suffix = '.md';
    sinon
      .stub(fs, 'existsSync')
      .withArgs(`${documentRoot}/${originFilename}${suffix}`)
      .returns(false);

    const result = app
      .mockContext()
      .helper.getAvailableFilePath(documentRoot, originFilename, suffix);

    assert(result === `${documentRoot}/${originFilename}${suffix}`);
  });
  it('should return origin file path when originFilename is start with "/" and origin path is not occupied', () => {
    const fs = require('fs');
    const documentRoot = '/fakePath/';
    const originFilename = 'fakeFilename';
    const suffix = '.md';
    sinon
      .stub(fs, 'existsSync')
      .withArgs(`${documentRoot}${originFilename}${suffix}`)
      .returns(false);

    const result = app
      .mockContext()
      .helper.getAvailableFilePath(documentRoot, '/' + originFilename, suffix);

    assert(result === `${documentRoot}${originFilename}${suffix}`);
  });
  it('should return origin file path when documentRoot is start with multiple "/" and origin path is not occupied', () => {
    const fs = require('fs');
    const documentRoot = '/fakePath/';
    const originFilename = 'fakeFilename';
    const suffix = '.md';
    sinon
      .stub(fs, 'existsSync')
      .withArgs(`${documentRoot}${originFilename}${suffix}`)
      .returns(false);

    const result = app
      .mockContext()
      .helper.getAvailableFilePath(
        documentRoot,
        '////' + originFilename,
        suffix
      );

    assert(result === `${documentRoot}${originFilename}${suffix}`);
  });
});
