/**
 * @apiDefine UserInfoSuccessData
 * @apiSuccess {Object} data 用户信息
 * @apiSuccess {String} data.id 用户id
 * @apiSuccess {String} data.username 用户名
 * @apiSuccess {String} data.role 用户权限角色
 * @apiSuccess {String} data.avatar 用户头像
 * @apiSuccess {String} data.createdAt 用户注册时间
 * @apiSuccess {String} data.updatedAt 信息最后更新时间
 */

/**
 * @apiDefine ShellTaskData
 * @apiSuccess {Object} data shell任务信息
 * @apiSuccess {number} data.id shell任务id
 * @apiSuccess {String} data.taskId shell任务id(uuid)
 * @apiSuccess {String} data.taskName shell任务名称
 * @apiSuccess {number=0,1,2,3} data.state 执行状态，0-排队中，1-执行中，2-执行完成, 3-执行失败
 * @apiSuccess {String} data.createdAt shell任务创建时间
 * @apiSuccess {String} data.updatedAt shell任务状态最后更新时间
 * @apiSuccess {String} data.log shell任务执行日志
 * @apiSuccess {number} data.timeConsumed shell任务执行耗时（执行结束后才会有值）
 * @apiSuccess {String} data.userId shell任务执行者id
 */

/**
 * @apiDefine VisitCountDetail
 * @apiSuccess (Success 200 详细数据-detail:true) {Object[]} data 详细数据，以时分区
 * @apiSuccess (Success 200 详细数据-detail:true) {number} data.pv 该小时新增pv
 * @apiSuccess (Success 200 详细数据-detail:true) {number} data.uv 该小时新增uv
 * @apiSuccess (Success 200 详细数据-detail:true) {number} data.year
 * @apiSuccess (Success 200 详细数据-detail:true) {number} data.month
 * @apiSuccess (Success 200 详细数据-detail:true) {number} data.day
 */

/**
 * @apiDefine VisitCount
 * @apiSuccess (Success 200 仅数值-默认) {Object} data 仅数值，筛选条件下的总数据
 * @apiSuccess (Success 200 仅数值-默认) {number} data.pv 筛选条件下总pv
 * @apiSuccess (Success 200 仅数值-默认) {number} data.uv 筛选条件下总uv
 */

/**
 * @apiDefine ArticleList
 * @apiSuccess {Object} data 数据
 * @apiSuccess {number} data.current 当前页数
 * @apiSuccess {number} data.total 总页数
 * @apiSuccess {number} data.pageSize 每页数据量
 * @apiSuccess {Object[]} data.list 文章列表
 * @apiSuccess {number} data.list.id 文章ID
 * @apiSuccess {string} data.list.title 标题
 * @apiSuccess {number} data.list.readCount 阅读量
 * @apiSuccess {string} data.list.lastModifiedAt 最后修改时间
 * @apiSuccess {string} data.list.createdAt 创建时间
 * @apiSuccess {number=0,1,2} data.list.state 状态，0-草稿，1-发布，2-删除
 * @apiSuccess {string} data.list.permalink 文章URL
 * @apiSuccess {Object} data.list.author 作者
 * @apiSuccess {number} data.list.author.id 作者ID
 * @apiSuccess {string} data.list.author.username 作者用户名
 */
