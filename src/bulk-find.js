ShoppingTools.bulkFind = {
  MIN_LISTINGS: 2,
  SCROLL_STEP_PX: 350,
  SCROLL_DELAY_MS: 450,
  MAX_IDLE_ROUNDS: 6,
  scanning: false,
  abortController: null,

  findFirstBulkSeller: function (signal, onStatus) {
    var self = this;
    var processed = new Set();
    var accountCounts = new Map();
    var loggedIn = ShoppingTools.dom.getLoggedInUsername();
    var scrollContainer = ShoppingTools.dom.getScrollContainer();
    var idleRounds = 0;
    var lastProcessedCount = 0;

    ShoppingTools.dom.scrollToTop(scrollContainer);
    onStatus('Scanning listings…');

    function scanLoop() {
      if (signal.aborted) {
        return Promise.resolve({ found: false, reason: 'aborted' });
      }

      var rows = ShoppingTools.dom.getResultRows();
      var i;
      for (i = 0; i < rows.length; i += 1) {
        var info = ShoppingTools.dom.extractListingInfo(rows[i]);
        if (!info) {
          continue;
        }
        if (loggedIn && info.accountName === loggedIn) {
          continue;
        }
        if (processed.has(info.listingKey)) {
          continue;
        }

        processed.add(info.listingKey);
        var entry = accountCounts.get(info.accountName);
        if (!entry) {
          entry = { count: 0 };
          accountCounts.set(info.accountName, entry);
        }
        entry.count += 1;

        if (entry.count >= self.MIN_LISTINGS) {
          onStatus('Found ' + info.accountName + ' (' + entry.count + ' listings). Opening trade…');
          rows[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
          return ShoppingTools.dom.sleep(500, signal).then(function () {
            ShoppingTools.dom.hardClick(info.directBtn);
            return { found: true, account: info.accountName, count: entry.count };
          });
        }
      }

      if (processed.size === lastProcessedCount) {
        idleRounds += 1;
        if (idleRounds >= self.MAX_IDLE_ROUNDS) {
          return Promise.resolve({ found: false, reason: 'no_seller_found' });
        }
        onStatus('Scrolling… (' + processed.size + ' listings checked)');
      } else {
        idleRounds = 0;
        lastProcessedCount = processed.size;
        onStatus('Scrolling… (' + processed.size + ' listings checked)');
      }

      ShoppingTools.dom.scrollDown(scrollContainer, self.SCROLL_STEP_PX);
      return ShoppingTools.dom.sleep(self.SCROLL_DELAY_MS, signal).then(scanLoop);
    }

    return scanLoop();
  }
};
