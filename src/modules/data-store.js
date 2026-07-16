const itemCache = new Map();
let searchIndexPromise = null;
let campaignNowPromise = null;

export async function loadItem(item) {
  if (!item?.dataPath) return item;
  const cacheKey = item.dataPath;
  if (!itemCache.has(cacheKey)) {
    itemCache.set(cacheKey, fetch(item.dataPath).then((response) => {
      if (!response.ok) throw new Error(`Unable to load ${item.title}`);
      return response.json();
    }));
  }
  const detail = await itemCache.get(cacheKey);
  return { ...item, ...detail };
}

export function loadSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch('search-index.json').then((response) => {
      if (!response.ok) throw new Error('Unable to load the search index');
      return response.json();
    });
  }
  return searchIndexPromise;
}

export function loadCampaignNow() {
  if (!campaignNowPromise) {
    campaignNowPromise = fetch('campaign-now.json').then((response) => {
      if (!response.ok) throw new Error('Unable to load the campaign summary');
      return response.json();
    });
  }
  return campaignNowPromise;
}
