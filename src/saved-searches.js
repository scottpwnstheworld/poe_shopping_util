ShoppingTools.savedSearches = {
  STORAGE_KEY: 'savedSearches',

  normalizeUrl: function (href) {
    var url = new URL(href, location.origin);
    url.hash = '';
    url.pathname = url.pathname.replace(/\/live\/?$/, '');
    return url.origin + url.pathname + url.search;
  },

  nameFromUrl: function (href) {
    return new Promise(function (resolve) {
      var name = window.prompt('Enter a name for this saved search:');

      if (name === null) {
        resolve('');
        return;
      }

      resolve(name.trim());
    });
  },

  isTradeSearchUrl: function (href) {
    try {
      var path = new URL(href, location.origin).pathname;
      return /\/trade2?\/(search|exchange)\//.test(path);
    } catch (err) {
      return false;
    }
  },

  getAll: function () {
    var key = this.STORAGE_KEY;
    return new Promise(function (resolve) {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        resolve([]);
        return;
      }
      chrome.storage.local.get(key, function (data) {
        resolve(Array.isArray(data[key]) ? data[key] : []);
      });
    });
  },

  setAll: function (searches) {
    var payload = {};
    payload[this.STORAGE_KEY] = searches;
    return new Promise(function (resolve) {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        resolve();
        return;
      }
      chrome.storage.local.set(payload, resolve);
    });
  }
};
