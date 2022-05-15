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
