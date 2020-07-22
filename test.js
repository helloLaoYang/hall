const fetch = require('./src/utils/fetch')



const start = async () => {
  const { data } = await fetch.get('/wechat/order/index?show_id=505&param=eyJkYXRlIjoiMjAyMC0wNy0yNCIsInBlcmlvZCI6WyI4NSwxMjowMCwxMzowMCJdLCJtb25leSI6NTAsInRvdGFsX2ZlZSI6NTB9')
  console.log(data)
}


start()