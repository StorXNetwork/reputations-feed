import axios from "axios"

// in usdt
const all_rates: any = {}

const GetPrice = () => {
  axios.get("https://www.bitrue.com/kline-api/publicUSDT.json?command=returnTicker").then(data => {
    const rates: any = data.data;
    if (rates.data?.SRX_USDT?.last) {
      all_rates.SRXUSDT = rates.data.SRX_USDT.last
    }
    if (rates.data?.XDC_USDT?.last) {
      all_rates.XDCUSDT = rates.data.XDC_USDT.last
    }
    global.logger.debug("rates updated")
  }).catch(global.logger.error)
}

GetPrice()

setInterval(GetPrice, 5 * 60 * 1000)

export const GetRates = () => all_rates