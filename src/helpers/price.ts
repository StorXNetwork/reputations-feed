import axios from "axios"

// in usdt
const all_rates: any = {}

const GetPrice = () => {
  axios.get("https://www.bitrue.com/api/v1/ticker/24hr").then(data => {
    const rates: Array<any> = data.data;

    for (let i = 0; i < rates.length; i++) {
      const coin = rates[i]
      all_rates[coin.symbol] = coin.lastPrice
    }
    global.logger.debug("rates updated")
  }).catch(global.logger.error)
}

GetPrice()

setInterval(GetPrice, 5 * 60 * 1000)

export const GetRates = () => all_rates