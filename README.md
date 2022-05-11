# VuePressAdmin

**该项目目前还处于早期开发阶段。**

这是VuePressAdmin的**后端**代码仓库。

![GitHub](https://img.shields.io/github/license/shadowfish07/VuePressAdmin-backend)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/shadowfish07/VuePressAdmin-backend/branch/main/graph/badge.svg?token=W4S7NR20G7)](https://codecov.io/gh/shadowfish07/VuePressAdmin-backend)

用类似WordPress的方式管理你的VuePress站点！

VuePressAdmin允许你方便地管理VuePress的配置、发布和管理文章，后续还将支持一键发布至多平台、允许多作者等功能。

## 安装并启动

```shell
npm install
``` 

启动测试服务器（热重载）

```shell
npm run dev
```

启动服务（适用于部署）

```shell
npm run start
```

停止服务

```shell
npm run stop
```

执行单元测试

```shell
npm run test # 会先检查eslint，再执行单元测试
npm run test-local # 直接执行单元测试
npm run test-local-without-shell # 直接执行单元测试，但跳过需要网络请求的shell测试
npm run cov # 执行单元测试，生成代码覆盖率报告
```

## 技术栈

VuePressAdmin后端部分主要使用的框架和库：

- VuePress（作为站点的驱动框架）
- EggJS（web服务框架）
- Shelljs（方便地执行shell）
- git（文章版本管理基于git进行）
- sinon（提供单元测试mock能力）

VuePressAdmin使用**sqlite**作为数据库。

VuePressAdmin基于**Angular Conventional Changelog**规范，使用**Commitizen**处理生成优雅、规范的代码提交记录。

VuePressAdmin使用**release-it**自动生成版本号、发布版本、生成CHANGELOG。

VuePressAdmin使用**codecov**提供集成化的代码覆盖率报告。

## 相关文章

建立、维护开源项目的过程让我了解、学会了很多新技术，故对一些自己印象深刻的经历做了总结，希望能够帮到更多的人。

- [只会MySQL？来看看SQLite！](https://blog.shadowfish0.top/2022-04-20-sqlite-de-te-dian.html)

在数据库选型上，我考虑过常用的MySQL，也考虑过MongoDB，不过最终选择了SQLite。我认为它在这个项目背景下非常适用，足够简单，足够灵活，足够容易学习。

- [用Commitizen实现优雅规范的commit风格](https://blog.shadowfish0.top/2022-04-28--gui-fan-hua-de-dai-ma-ti-jiao.html)

逛GitHub的时候发现现在越来越多的库的提交风格都规范统一，特别优雅，故借此机会探索了规范提交风格方面的技术，在本项目中也会一直贯彻落实。

- [聊聊Nodejs的单元测试，要怎么测试涉及子线程逻辑的代码？](https://blog.shadowfish0.top/2022-05-05-nodejs-dan-yuan-ce-shi.html)

玩单元测试时的一些感受~涉及到了对sinon、proxyquire的一些探讨
