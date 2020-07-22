
/**
 * axios fetch封装
 */
const axios = require('axios')
const { PHPSESSID } = require('../../config') 

const instance = axios.create({
  baseURL: 'https://xihuwenti.juyancn.cn',
  timeout: 800,
  headers: {
    Cookie: `PHPSESSID=${ PHPSESSID }`,
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.14(0x17000e28) NetType/WIFI Language/zh_CN',
  },
})


instance.interceptors.response.use(response => {
  const { config, data } = response
  const { method } = config
  return (method || '').toLocaleLowerCase() === 'get'
    ? data
    : data && data instanceof Object
      ? data
      : { code: -1, msg: data }
}, error => {
  return Promise.reject(error)
})

module.exports = instance
