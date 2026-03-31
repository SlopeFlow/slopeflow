// Yahoo Finance API wrapper — dividend stocks
// Uses public endpoint, no key required

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const QUOTE_BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';

export async function getStockQuote(ticker) {
  const res = await fetch(`${QUOTE_BASE}?symbols=${ticker}&fields=regularMarketPrice,regularMarketChangePercent,trailingAnnualDividendYield,shortName`);
  const data = await res.json();
  const q = data.quoteResponse.result[0];
  return {
    ticker,
    name:         q.shortName,
    price:        q.regularMarketPrice,
    change24h:    q.regularMarketChangePercent,
    dividendYield: q.trailingAnnualDividendYield
      ? (q.trailingAnnualDividendYield * 100).toFixed(2) + '%'
      : 'N/A',
  };
}

export async function getMultipleQuotes(tickers = []) {
  const symbols = tickers.join(',');
  const res = await fetch(`${QUOTE_BASE}?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,trailingAnnualDividendYield,shortName`);
  const data = await res.json();
  return data.quoteResponse.result.map(q => ({
    ticker:        q.symbol,
    name:          q.shortName,
    price:         q.regularMarketPrice,
    change24h:     q.regularMarketChangePercent,
    dividendYield: q.trailingAnnualDividendYield
      ? (q.trailingAnnualDividendYield * 100).toFixed(2) + '%'
      : 'N/A',
  }));
}

// Default starter watchlist for teens — solid dividend compounders
export const DEFAULT_WATCHLIST = ['SCHD', 'O', 'JNJ', 'KO', 'VYM'];
