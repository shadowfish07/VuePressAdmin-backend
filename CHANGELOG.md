

# 0.2.0-alpha.1 (2022-05-10)


### Bug Fixes

* **config:** 初始化数据库时，config表hasInit字段值设为0 ([250df7e](https://github.com/shadowfish07/VuePressAdmin-backend/commit/250df7e5ceba242ed2ab18d4caa43fc01ca16e89))
* **config:** 现在PATCH /api/config对需要boolean值的配置有严格校验和预转换，保证最后存入数据库的值为1/0 ([64d0660](https://github.com/shadowfish07/VuePressAdmin-backend/commit/64d06604051fdcac067449686348fd2b11743996))
* **egg-config:** vuepress path现在指定绝对路径名 ([1f5b66f](https://github.com/shadowfish07/VuePressAdmin-backend/commit/1f5b66f1594be2e6d2f30eb0a5ca5d966dff1983))
* **extend:** 修复startShellTask线程调用失败时写入数据库的状态为成功的BUG ([2e59105](https://github.com/shadowfish07/VuePressAdmin-backend/commit/2e591057ce9877e4c262f77f73703c121dbdc387))
* **init-recox-template-shell:** 涉及动态路径的地方用双引号包裹 ([0425ad7](https://github.com/shadowfish07/VuePressAdmin-backend/commit/0425ad7c88835657ee15c87ff0f11644038051be))
* **shell-init-recox-template:** 修复执行站点初始化时vuepress目录错误的BUG ([6509e90](https://github.com/shadowfish07/VuePressAdmin-backend/commit/6509e903d7ffd2175862ca2015d1e42cdf6b0f79))
* **shell-init-recox-template:** 修复rm -rf无效的问题 ([3f4a71d](https://github.com/shadowfish07/VuePressAdmin-backend/commit/3f4a71d138398834d2c4e9b4dcaf5bda0c549fa8))


### Features

* **article:** 更改新建文章逻辑，去掉了templates，改为直接用json生成frontmatter ([9f22ec8](https://github.com/shadowfish07/VuePressAdmin-backend/commit/9f22ec8436085f3e9a67ea5bc999884daaee0373))
* **article:** 添加新增文章接口POST /api/article，引入fs-extra，git-parse ([d2217ca](https://github.com/shadowfish07/VuePressAdmin-backend/commit/d2217caec37a353b2530865ce1659f28fd442099)), closes [#8](https://github.com/shadowfish07/VuePressAdmin-backend/issues/8)
* **article:** 添加PUT /api/article/:id 编辑文章接口，引入factory-girl，抽提测试时的数据库init到全局执行 ([5b7966f](https://github.com/shadowfish07/VuePressAdmin-backend/commit/5b7966f859644cee153ec976bee50e8903e7fbb4)), closes [#10](https://github.com/shadowfish07/VuePressAdmin-backend/issues/10)
* **article:** 现在新增文章时默认为草稿，article表添加删除、草稿字段，细化抽提vuepress config中的path定义 ([fb792a3](https://github.com/shadowfish07/VuePressAdmin-backend/commit/fb792a3ae4035273060a7b6f56deb07000aca60d))
* **article:** 新文章默认使用文章ID作为永久链接，article表添加permalink ([99f2b05](https://github.com/shadowfish07/VuePressAdmin-backend/commit/99f2b0561af916ff9d38cac81ed32c598cc8e2ef))
* **article:** article表添加content字段，为一些字段添加默认值，添加articleHistory表 ([77ff2bf](https://github.com/shadowfish07/VuePressAdmin-backend/commit/77ff2bf85dd2de6de6f5a00ac0f78d2568db0b4c))
* **auth:** 在auth中间件写入ctx.userId ([8886266](https://github.com/shadowfish07/VuePressAdmin-backend/commit/888626660e40fe6dfde6d5e12c7512bd2544bdf0))
* **config:** 添加POST /api/config/init 接口，暂不支持远程库 ([94e67de](https://github.com/shadowfish07/VuePressAdmin-backend/commit/94e67de901dbc2f81be7b8b758cf033b7546632c))
* **config:** 现在PATCH /api/config接口会强制要求application/json ([c1235a4](https://github.com/shadowfish07/VuePressAdmin-backend/commit/c1235a4db7fba54025123e45b75c62e46a871532))
* **git:** 移除了/api/git/repository/init接口及相关逻辑 ([6a2d856](https://github.com/shadowfish07/VuePressAdmin-backend/commit/6a2d8565f07b99ee3777c1fd550881f96615e97c))
* **helper:** 添加getAvailableFilePath方法 ([c4edc5e](https://github.com/shadowfish07/VuePressAdmin-backend/commit/c4edc5e429d015e3bfcc60c41b1ec7406d84fcf1))
* **helper:** updateOrCreate添加了返回值 ([c0e0286](https://github.com/shadowfish07/VuePressAdmin-backend/commit/c0e0286f241a8bdc190d31127319505cb559ea79))
* **initrecoxtemplate:** 添加用VuePressTemplate-recoX初始化VuePress目录的脚本 ([46f5b52](https://github.com/shadowfish07/VuePressAdmin-backend/commit/46f5b52b55202283c25bbcc082f2d55f6d809396))
* **middleware:** 添加log中间件，对请求入参、返回值body进行记录 ([d7dd36f](https://github.com/shadowfish07/VuePressAdmin-backend/commit/d7dd36fed33efb00c8a27dd2efaa956f9d95c16a)), closes [#4](https://github.com/shadowfish07/VuePressAdmin-backend/issues/4)
* response返回中的data还会附带traceId，引入了egg-traceId ([72e4efd](https://github.com/shadowfish07/VuePressAdmin-backend/commit/72e4efd72e837e8df24da2e9f8c2c9b348aa71bd))
* **shell-init-recox-template:** 初始化仓库时设置默认git用户信息 ([ce36e42](https://github.com/shadowfish07/VuePressAdmin-backend/commit/ce36e42d2f683f982e7cb7c7713a27fa9ff547e1))
* **shell:** shell文件导出函数，添加process.env区分手动触发和导入函数的情况 ([9247267](https://github.com/shadowfish07/VuePressAdmin-backend/commit/92472677f6fd4d51a3bf1d2a98071bc4ee938f15))
* **shell:** vuepress目录通过配置传递，shell中也会执行目录配置传递 ([bfcafd5](https://github.com/shadowfish07/VuePressAdmin-backend/commit/bfcafd59f506b491d54b77705b94b88e44b6e8d5))
* **start-shell-task:** startShellTask添加args,callback参数，支持传入更多参数和支持子线程执行完毕后执行回调的能力 ([ffa8aa1](https://github.com/shadowfish07/VuePressAdmin-backend/commit/ffa8aa15a2faa334b6322ce59d1cea1d0ced1be3))
* **startshelltask:** startShellTask会返回taskId，在日志读取失败（或为空）时不会删除日志文本 ([31fd479](https://github.com/shadowfish07/VuePressAdmin-backend/commit/31fd479d26a170e3e2ad42a82dd0d25f3401bd92))
* **sync-shell:** 加入同步shell任务队列机制，shellTask表还会记录时间花费 ([a01bafb](https://github.com/shadowfish07/VuePressAdmin-backend/commit/a01bafb8282b57b548df2bce5dc41ea256a481dc))
* **user:** 用户登录时签发session还会附带role信息 ([526dd9b](https://github.com/shadowfish07/VuePressAdmin-backend/commit/526dd9b3c9ec0d266253ccb07eca90b5772718a0))
* **vuepress:** 新增vuepress模块，添加build VuePress、重新安装npm依赖接口，并把原来初始化站点脚本的测试改为测试shell文件的统一测试 ([8d46e95](https://github.com/shadowfish07/VuePressAdmin-backend/commit/8d46e9514efec065b7e46f97ef30d951a5076c5e)), closes [#30](https://github.com/shadowfish07/VuePressAdmin-backend/issues/30)


### Performance Improvements

* **init-recox-template-shell:** 初始化VuePress时换用删除.git目录，重新init ([706ae6e](https://github.com/shadowfish07/VuePressAdmin-backend/commit/706ae6e7438db474fc788b3dd5d4d7801fdf5bc0))


### Reverts

* "test(startshelltask): 添加对vuepress路径的测试" ([6034ad2](https://github.com/shadowfish07/VuePressAdmin-backend/commit/6034ad268fe72aa3bfd92f60a8936a5ec5c1864f))
