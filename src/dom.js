ShoppingTools.dom = {
  hardClick: function (el) {
    try {
      if (el.focus) {
        el.focus();
      }
      ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(function (type) {
        el.dispatchEvent(new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0
        }));
      });
      if (el.click) {
        el.click();
      }
    } catch (err) {
      /* ignore */
    }
  },

  sleep: function (ms, signal) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(resolve, ms);
      if (!signal) {
        return;
      }
      if (signal.aborted) {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', function () {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  },

  isScrollable: function (element) {
    if (!element) {
      return false;
    }
    var style = getComputedStyle(element);
    var overflowY = style.overflowY;
    var allowsScroll = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
    return allowsScroll && element.scrollHeight > element.clientHeight + 8;
  },

  getScrollContainer: function () {
    var candidates = [
      document.querySelector('#trade .results'),
      document.querySelector('.results')
    ];
    var i;
    for (i = 0; i < candidates.length; i += 1) {
      if (ShoppingTools.dom.isScrollable(candidates[i])) {
        return candidates[i];
      }
    }
    var node = document.querySelector('.resultset');
    while (node && node !== document.body) {
      if (ShoppingTools.dom.isScrollable(node)) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  },

  scrollToTop: function (container) {
    if (container) {
      container.scrollTop = 0;
      return;
    }
    window.scrollTo(0, 0);
  },

  scrollDown: function (container, stepPx) {
    if (container) {
      container.scrollTop += stepPx;
      return;
    }
    window.scrollBy(0, stepPx);
  },

  getLoggedInUsername: function () {
    var el = document.querySelector('.loggedInStatus .profile-link a');
    return el ? el.textContent.trim() : null;
  },

  getListingKey: function (row) {
    var nested = row.querySelector('[data-id]');
    return row.getAttribute('data-id') || (nested && nested.getAttribute('data-id')) || row;
  },

  getResultRows: function () {
    var rows = [];
    document.querySelectorAll('.resultset').forEach(function (resultset) {
      Array.from(resultset.children).forEach(function (child) {
        if (child.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        if (child.querySelector('span.error')) {
          return;
        }
        rows.push(child);
      });
    });
    return rows;
  },

  extractListingInfo: function (row) {
    var profileLink = row.querySelector('span.profile-link a');
    var directBtn = row.querySelector('button.direct-btn');
    if (!profileLink || !directBtn || directBtn.disabled) {
      return null;
    }
    return {
      accountName: profileLink.textContent.trim(),
      directBtn: directBtn,
      row: row,
      listingKey: ShoppingTools.dom.getListingKey(row)
    };
  },

  isVisible: function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }
    var cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  },

  mark: function (el, color) {
    el.style.outline = '2px solid ' + (color || '#00e676');
    el.style.outlineOffset = '2px';
    setTimeout(function () {
      el.style.outline = '';
    }, 500);
  }
};
