ShoppingTools.liveArm = {
  TARGET_SELECTOR: 'button.direct-btn',
  DEMAND_DELAY_MS: 1,
  DEMAND_LINGER_MS: 8000,
  HOTKEY: { alt: true, key: 'r' },
  armed: false,
  mutationObserver: null,
  lastClickedEl: null,
  lingerUntil: 0,
  lingerTimer: null,
  onChange: function () {},

  norm: function (t) {
    return (t || '').replace(/\s+/g, ' ').trim().toLowerCase();
  },

  buttonText: function (el) {
    return this.norm(el.innerText || el.textContent || '');
  },

  isTravelText: function (t) {
    return t === 'travel to hideout';
  },

  isDemandText: function (t) {
    return t.indexOf('in demand') !== -1;
  },

  isTarget: function (el) {
    if (!(el instanceof HTMLElement)) {
      return false;
    }
    if (el.closest('#bulk-shopper-widget')) {
      return false;
    }
    if (el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    if (!ShoppingTools.dom.isVisible(el)) {
      return false;
    }
    var t = this.buttonText(el);
    return this.isTravelText(t) || this.isDemandText(t);
  },

  findTargets: function () {
    var self = this;
    var all = Array.from(document.querySelectorAll(this.TARGET_SELECTOR)).filter(function (el) {
      return self.isTarget(el);
    });
    var travel = all.find(function (el) {
      return self.isTravelText(self.buttonText(el));
    });
    var demand = all.find(function (el) {
      return self.isDemandText(self.buttonText(el));
    });
    return travel || demand || null;
  },

  findDemandTarget: function () {
    var self = this;
    return Array.from(document.querySelectorAll(this.TARGET_SELECTOR)).find(function (el) {
      return self.isTarget(el) && self.isDemandText(self.buttonText(el));
    }) || null;
  },

  isLingering: function () {
    return Date.now() < this.lingerUntil;
  },

  isLiveActive: function () {
    return this.armed || this.isLingering();
  },

  clearLinger: function () {
    this.lingerUntil = 0;
    if (this.lingerTimer) {
      clearTimeout(this.lingerTimer);
      this.lingerTimer = null;
    }
  },

  startDemandLinger: function () {
    var self = this;
    this.clearLinger();
    this.lingerUntil = Date.now() + this.DEMAND_LINGER_MS;
    this.lingerTimer = setTimeout(function () {
      self.lingerTimer = null;
      self.lingerUntil = 0;
      if (!self.armed) {
        self.onChange('In Demand window ended. Disarmed.', 'success');
      }
    }, this.DEMAND_LINGER_MS);
  },

  clickDemand: function (el) {
    ShoppingTools.dom.mark(el);
    this.armed = false;
    this.clearLinger();
    this.lastClickedEl = el;
    this.onChange('Clicked in demand. Disarmed.', 'success');
    setTimeout(function () {
      ShoppingTools.dom.hardClick(el);
    }, this.DEMAND_DELAY_MS);
  },

  checkForNewTargets: function () {
    if (this.isLingering()) {
      var demand = this.findDemandTarget();
      if (demand) {
        this.clickDemand(demand);
      }
      return;
    }

    if (!this.armed) {
      return;
    }

    var el = this.findTargets();
    if (!el) {
      return;
    }

    var txt = this.buttonText(el);
    if (this.isDemandText(txt)) {
      this.clickDemand(el);
      return;
    }

    if (this.lastClickedEl === el) {
      return;
    }

    ShoppingTools.dom.mark(el);
    this.armed = false;
    this.lastClickedEl = el;
    ShoppingTools.dom.hardClick(el);
    this.startDemandLinger();
    this.onChange('Clicked travel. Watching for In Demand…');
  },

  setupMutationObserver: function () {
    var self = this;
    if (this.mutationObserver) {
      return;
    }

    this.mutationObserver = new MutationObserver(function (mutations) {
      if (self.isLingering()) {
        self.checkForNewTargets();
        return;
      }

      var m;
      var n;
      for (m = 0; m < mutations.length; m += 1) {
        var mutation = mutations[m];
        if (mutation.type !== 'childList') {
          continue;
        }
        for (n = 0; n < mutation.addedNodes.length; n += 1) {
          var node = mutation.addedNodes[n];
          if (node.nodeType !== Node.ELEMENT_NODE) {
            continue;
          }
          if (node.matches && node.matches(self.TARGET_SELECTOR) && self.isTarget(node)) {
            self.checkForNewTargets();
            return;
          }
          if (node.querySelector && node.querySelector(self.TARGET_SELECTOR)) {
            var targets = Array.from(node.querySelectorAll(self.TARGET_SELECTOR)).filter(function (el) {
              return self.isTarget(el);
            });
            if (targets.length > 0) {
              self.checkForNewTargets();
              return;
            }
          }
        }
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  },

  setupClickListeners: function () {
    var self = this;
    document.addEventListener('click', function (e) {
      if (e.target.matches && e.target.matches(self.TARGET_SELECTOR) && self.isTarget(e.target)) {
        setTimeout(function () {
          self.checkForNewTargets();
        }, 10);
      }
    }, true);
  },

  onKeyDown: function (e) {
    var ae = document.activeElement;
    var typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
    if (typing) {
      return;
    }

    var keyMatch = (e.key || '').toLowerCase() === this.HOTKEY.key.toLowerCase();
    if (!!e.altKey === !!this.HOTKEY.alt && !!e.ctrlKey === !!this.HOTKEY.ctrl && !!e.shiftKey === !!this.HOTKEY.shift && keyMatch) {
      this.clearLinger();
      this.armed = true;
      this.lastClickedEl = null;
      this.onChange('Armed. Waiting for listings...');
    }
  },

  arm: function () {
    this.armed = true;
    this.lastClickedEl = null;
    this.onChange();
    var self = this;
    setTimeout(function () {
      self.checkForNewTargets();
    }, 100);
  },

  disarm: function (message, type) {
    this.armed = false;
    this.clearLinger();
    this.onChange(message || 'Disarmed.', type || 'error');
  },

  start: function () {
    var self = this;
    this.setupMutationObserver();
    this.setupClickListeners();
    window.addEventListener('keydown', function (e) {
      self.onKeyDown(e);
    }, true);
  }
};
