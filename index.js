
/**
 * 论： 如何抢文体中心场地
 * 我已经连续好几周抢不到场地打球了
 */
require('colors')
const ora = require('ora')

const Roll = require('./src')
const roll = new Roll()

const spinner = ora('脚本运行中...\n'.green).start()

const start = () => roll.start().then(
  () => spinner.succeed(`运行成功，请在10分钟之内支付！`.green)
).catch((error) => {
  console.log(`fail: ${ error.message || '未知原因'}\n正在重试...\n`.red)
  // setTimeout(start, 250)
})

start()

