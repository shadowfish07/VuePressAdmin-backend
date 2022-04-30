'use strict';

const { app, assert } = require('egg-mock/bootstrap');

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
