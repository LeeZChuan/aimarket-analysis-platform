import { STOCK_CATALOG } from './catalog.mjs';

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function compact(value) {
  return normalize(value).replace(/[\s._-]+/g, '');
}

function scoreStock(stock, query) {
  const normalizedQuery = normalize(query);
  const compactQuery = compact(query);
  const symbol = stock.symbol.toLowerCase();

  if (!normalizedQuery) return 0;
  if (compactQuery === symbol) return 1;
  if (compactQuery.includes(symbol)) return 0.96;

  let best = 0;
  for (const alias of stock.aliases) {
    const normalizedAlias = normalize(alias);
    const compactAlias = compact(alias);
    if (!normalizedAlias) continue;

    if (normalizedQuery === normalizedAlias || compactQuery === compactAlias) {
      best = Math.max(best, 0.95);
    } else if (normalizedQuery.includes(normalizedAlias) || compactQuery.includes(compactAlias)) {
      const lengthBonus = Math.min(0.08, compactAlias.length / 100);
      best = Math.max(best, 0.82 + lengthBonus);
    }
  }

  return Math.min(1, best);
}

export function findStockBySymbol(symbol) {
  const normalized = compact(symbol);
  return STOCK_CATALOG.find((stock) => stock.symbol.toLowerCase() === normalized) || null;
}

export function searchStocks(keyword, limit = 20) {
  const query = normalize(keyword);
  if (!query) {
    return STOCK_CATALOG.slice(0, limit);
  }

  return STOCK_CATALOG
    .map((stock) => ({
      stock,
      score: scoreStock(stock, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.stock.symbol.localeCompare(b.stock.symbol))
    .slice(0, limit)
    .map((item) => item.stock);
}

export function resolveStock({ query, symbol }) {
  if (symbol) {
    const stock = findStockBySymbol(symbol);
    if (stock) {
      return {
        stock,
        confidence: 1,
      };
    }
  }

  const matches = STOCK_CATALOG
    .map((stock) => ({
      stock,
      score: scoreStock(stock, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.stock.symbol.localeCompare(b.stock.symbol));

  if (!matches.length) return null;

  return {
    stock: matches[0].stock,
    confidence: Number(matches[0].score.toFixed(2)),
  };
}
