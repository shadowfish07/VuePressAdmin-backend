'use strict';

const { assert, app } = require('egg-mock/bootstrap');

const sinon = require('sinon');
const FakeChildProcess = require('../../util/FakeChildProcess');
const FakeReadableStream = require('../../util/FakeReadableStream');

describe('startShellTask()', () => {
  const RUNNING = 1;
  const FINISHED = 2;
  const FAILED = 3;
  afterEach(() => {
    sinon.restore();
  });
  it('should success when no error occurs', async () => {
    const ctx = app.mockContext();
    app.mockSession({
      userId: 1,
    });
    const childProcess = require('child_process');
    const fakeChildProcess = new FakeChildProcess();

    sinon.mock(childProcess).expects('fork').returns(fakeChildProcess);

    const taskId = await ctx.startShellTask('initRecoXTemplate');

    const task = await app.model.ShellTask.findOne({
      where: {
        taskId,
      },
    });

    assert(taskId);
    assert(task.taskId === taskId);
    assert(task.state === RUNNING);
    assert(task.userId === 1);
    assert(task.taskName === '使用模板VuePressTemplate-recoX初始化VuePress');

    const fakeReadableStream = new FakeReadableStream([
      'first line',
      'second line',
    ]);

    // 模拟子进程产生stdout
    fakeReadableStream.on('data', (data) => {
      fakeChildProcess.emitStdout('data', data);
    });

    fakeReadableStream.on('end', () => {
      fakeChildProcess.emitStdout('end');
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });

    await task.reload();

    assert(task.state === FINISHED);

    assert(task.log);

    const fs = require('fs');
    assert(!fs.existsSync('/shellOutput/' + taskId + '.log'));
  });
  it('should success when error occurs', async () => {
    const ctx = app.mockContext();
    app.mockSession({
      userId: 1,
    });
    const childProcess = require('child_process');
    const fakeChildProcess = new FakeChildProcess();

    sinon.mock(childProcess).expects('fork').returns(fakeChildProcess);

    const taskId = await ctx.startShellTask('initRecoXTemplate');

    const task = await app.model.ShellTask.findOne({
      where: {
        taskId,
      },
    });

    assert(taskId);
    assert(task.taskId === taskId);
    assert(task.state === RUNNING);
    assert(task.userId === 1);
    assert(task.taskName === '使用模板VuePressTemplate-recoX初始化VuePress');

    const fakeReadableStream = new FakeReadableStream([
      'first line',
      'second line',
    ]);

    // 模拟子进程产生stdout
    fakeReadableStream.on('data', (data) => {
      fakeChildProcess.emitStdout('data', data);
    });

    fakeReadableStream.on('end', () => {
      fakeChildProcess.emitMessage({ msg: 'error !!' });
      fakeChildProcess.emitStdout('end');
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });

    await task.reload();

    assert(task.state === FAILED);

    assert(task.log);

    const fs = require('fs');
    assert(!fs.existsSync('/shellOutput/' + taskId + '.log'));
  });
});
