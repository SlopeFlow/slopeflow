// Signal Feed API — curated crypto + finance news
// Sources: CoinGecko trending + free RSS feeds (no API key needed)
// Noise filter: removes influencer/shill content, keeps signal

// Trusted RSS sources — high signal, low noise
const RSS_SOURCES = [
  { url: 'https://feeds.feedburner.com/CoinDesk', name: 'CoinDesk' },
  { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' },
];

// Noise keywords — filter these out
const NOISE_KEYWORDS = [
  'sponsored', 'advertisement', 'press release', 'partner content',
  '100x', 'moonshot', 'gem', 'airdrop', 'giveaway', 'guaranteed',
  'get rich', 'pump', 'shitcoin', 'meme coin', 'rug pull',
];

// Signal keywords — boost these
const SIGNAL_KEYWORDS = [
  'bitcoin', 'btc', 'fed', 'inflation', 'cpi', 'interest rate',
  'halving', 'etf', 'institutional', 'sec', 'regulation',
  'market', 'price', 'analysis', 'chart', 'support', 'resistance',
  'earnings', 'dividend', 'macro',
];

// Tag classifier
function classifyArticle(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('bitcoin') || text.includes('btc')) return { tag: '₿ BTC', color: '#00E5FF' };
  if (text.includes('fed') || text.includes('inflation') || text.includes('macro')) return { tag: '📊 MACRO', color: '#FFD600' };
  if (text.includes('etf') || text.includes('institutional')) return { tag: '🏦 INST', color: '#00E676' };
  if (text.includes('regulation') || text.includes('sec')) return { tag: '⚖️ REG', color: '#FF6D00' };
  if (text.includes('stock') || text.includes('equity') || text.includes('dividend')) return { tag: '📈 STOCKS', color: '#00E676' };
  return { tag: '📰 NEWS', color: '#9E9E9E' };
}

// Score article for signal quality (higher = better)
function scoreArticle(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  let score = 0;
  SIGNAL_KEYWORDS.forEach(k => { if (text.includes(k)) score += 2; });
  NOISE_KEYWORDS.forEach(k => { if (text.includes(k)) score -= 5; });
  return score;
}

// CoinGecko news endpoint removed — using RSS only

// Parse RSS via rss2json proxy (no backend needed)
async function fetchRSS(source) {
  try {
    const encoded = encodeURIComponent(source.url);
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}&count=10`);
    const data = await res.json();
    if (data.status !== 'ok') return [];
    return data.items.map(item => ({
      id:          item.guid ?? item.link,
      title:       item.title,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) ?? '',
      url:         item.link,
      source:      source.name,
      publishedAt: new Date(item.pubDate),
      image:       item.thumbnail ?? item.enclosure?.link ?? null,
    }));
  } catch (e) {
    console.error(`RSS error (${source.name}):`, e);
    return [];
  }
}

// Main feed fetch — combines sources, filters noise, ranks by signal
export async function getSignalFeed() {
  const rssFeeds = await Promise.all(RSS_SOURCES.map(fetchRSS));

  const all = rssFeeds.flat();

  // Filter noise, score, sort
  const filtered = all
    .filter(a => scoreArticle(a.title, a.description) > -1)
    .map(a => ({
      ...a,
      score:   scoreArticle(a.title, a.description),
      ...classifyArticle(a.title, a.description),
    }))
    .sort((a, b) => b.score - a.score || b.publishedAt - a.publishedAt)
    .slice(0, 25); // top 25 stories

  return filtered;
}

// Time ago helper
export function timeAgo(date) {
  const d = new Date(date); if (isNaN(d.getTime())) return 'recently'; const seconds = Math.floor((Date.now() - d.getTime()) / 1000); if (seconds < 0) return 'just now';
  if (seconds < 60)   return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
