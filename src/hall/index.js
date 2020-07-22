const qs = require('querystring')
const cheerio = require('cheerio')
const { hallId, time, startTime, endTime, userInfo } = require('../../config')
const fetch = require('../utils/fetch')

/**
 * 解析页面HTML
 * 获取可选场地编号(hall_id)
 * @param
 */
const formatHTML = ($) => {
  const $selectList = $('.can-select')
  if (!$selectList || !$selectList.length) {
    throw Error('整场均无空余场地')
  }
  const $hallList = Array.prototype.map.call($selectList, ({ attribs }) => {
    const start = attribs['data-start']
    const end = attribs['data-end']
    const hall_id = attribs['data-hall_id']
    const money = attribs['data-cost_price']
    return {
      start,
      end,
      hall_id,
      money: ((money || 0) * 1).toFixed(2),
    }
  }).filter(({ start, end }) => (startTime === start, end === endTime))
  if (!$hallList || !$hallList.length) {
    throw Error('当前设置时段，无空余场地')
  }
  return $hallList
}

/**
 * 获取页面html
 */
const queryHallHtml = async () => {
  const { data: html } = await fetch.get(`/wechat/product/details?${
    qs.stringify({
      id: hallId,
      time: (new Date(`${ time } 00:00:00`).getTime()) / 1000,
    })
  }`)
  // 查询场地是否开启预约
  if (!html || !html.includes(hallId)) {
    throw Error('尚未开启预约')
  }
  // 格式化html，获取可选场地数据
  const $list = formatHTML(cheerio.load(html))
  // 随机一个场地
  return $list[Math.floor(Math.random() * $list.length)]
}

/**
 * 渲染一下下单页面
 */
const renderOrderConfirmView = async (param) => {
  const { data: html } = await fetch.get(`/wechat/order/index?${ qs.stringify({
    show_id: hallId,
    param,
  }) }`)
  if (!html || !html.includes(hallId)) {
    throw Error('微信授权出现问题')
  }
}

/**
 * 生成订单群签名字符串
 */
const createOrderSignRandomStr = async () => {
  const { 
    start,
    end,
    money,
    hall_id,
  } = await queryHallHtml()
  const data = {
    show_id: hallId,
    date: time,
    'data[]': [hall_id, start, end].join(','),
    money,
    total_fee: `${ money }元`,
  }
  const { data: response } = await fetch.post('/wechat/product/save', qs.stringify(data))
  const { code = -1, msg = '生成订单签名失败' } = response && response instanceof Object ? response : {}
  if (code !== 0) {
    throw Error(msg)
  }
  return msg
}

/**
 * 创建订单
 */
module.exports = async () => {
  const param = await createOrderSignRandomStr()
  await renderOrderConfirmView(param)
  const data = Object.assign({}, userInfo, {
    show_id: hallId,
    param,
  })
  const { data: response } = await fetch.post('/wechat/order/add', qs.stringify(data))
  const { code = -1, msg = '微信授权出现问题' } = response && response instanceof Object ? response : {}
  if (code !== 0) {
    throw Error(msg)
  }
  return '生成订单成功'
}