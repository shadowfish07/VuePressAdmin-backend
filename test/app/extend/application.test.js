'use strict';
const { app, assert } = require('egg-mock/bootstrap');

describe('SyncShell', () => {
  afterEach(() => {
    app.syncShell.forceReset();
  });
  it('should execute directly when the queue is empty', async () => {
    let runCalled = false;
    let readyToGoCalled = false;
    await app.syncShell.pushShell({
      run: async () => {
        runCalled = true;
        await app.syncShell.emitShellEnd();
      },
      info: {
        taskId: '123',
      },
      readyToGo: () => {
        readyToGoCalled = true;
      },
    });

    assert(runCalled);
    assert(readyToGoCalled);
  });
  it('should wait for the previous task to finish', async () => {
    let runCalled = 0;
    let readyToGoCalled = 0;
    await app.syncShell.pushShell({
      run: () => {
        runCalled++;
        // 不触发结束标记
      },
      info: {
        taskId: '123',
      },
      readyToGo: () => {
        readyToGoCalled++;
      },
    });

    assert(runCalled === 1);
    assert(readyToGoCalled === 1);

    // 第二个任务，但等待执行
    await app.syncShell.pushShell({
      run: async () => {
        runCalled++;
        await app.syncShell.emitShellEnd();
      },
      info: {
        taskId: '123',
      },
      readyToGo: () => {
        readyToGoCalled++;
      },
    });

    assert(runCalled === 1);
    assert(readyToGoCalled === 1);

    // 再添加一个任务
    await app.syncShell.pushShell({
      run: async () => {
        runCalled++;
        await app.syncShell.emitShellEnd();
      },
      info: {
        taskId: '123',
      },
      readyToGo: () => {
        readyToGoCalled++;
      },
    });

    // 结束上一个任务
    await app.syncShell.emitShellEnd();

    assert(runCalled === 3);
    assert(readyToGoCalled === 3);
  });
});
