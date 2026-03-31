// CoinGecko API — BTC + market data
// Free tier, no key required for basic calls

const BASE = 'https://api.coingecko.com/api/v3';

export async function getBTCPrice() {
  const res = await fetch(
    `${BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
  );
  const data = await res.json();
  return {
    price:     data.bitcoin.usd,
    change24h: data.bitcoin.usd_24h_change,
    marketCap: data.bitcoin.usd_market_cap,
    volume24h: data.bitcoin.usd_24h_vol,
  };
}

export async function getBTCChart(days = 1, interval = null) {
  // days: 0.010417 (15m), 0.041667 (1H), 0.166667 (4H), 1, 7, 30, 365
  // CoinGecko free tier: use 'minutely' for <1 day, auto otherwise
  const intervalParam = interval ? `&interval=${interval}` : '';
  const res = await fetch(
    `${BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}${intervalParam}`
  );
  const data = await res.json();
  return data.prices.map(([time, price]) => ({ time, price }));
}

export async function getBTCStats() {
  const res = await fetch(`${BASE}/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false`);
  const data = await res.json();
  return {
    ath:           data.market_data.ath.usd,
    athDate:       data.market_data.ath_date.usd,
    high24h:       data.market_data.high_24h.usd,
    low24h:        data.market_data.low_24h.usd,
    circulatingSupply: data.market_data.circulating_supply,
    maxSupply:     data.market_data.max_supply, // 21M
    halvingContext: '~21 million max supply. Next halving ~2028.',
  };
}
