ShoppingTools.widget = {
  create: function () {
    if (document.getElementById('bulk-shopper-widget')) {
      return;
    }

    var extensionVersion = 'unknown';
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      extensionVersion = chrome.runtime.getManifest().version;
    }

    var widget = document.createElement('div');
    widget.id = 'bulk-shopper-widget';
    widget.className = 'bs-collapsed';
    widget.innerHTML =
    '<button type="button" class="bs-toggle" id="bulk-shopper-toggle" title="Toggle Shopping Tools">⚒</button>' +
      '<div class="bs-panel">' +
        '<div class="bs-title">Shopping Tools (' + extensionVersion + ')</div>' +
        '<div class="bs-status" id="bulk-shopper-status">Ready. Run a trade search first.</div>' +
        '<div class="bs-actions">' +
          '<button type="button" class="bs-find-btn" id="bulk-shopper-find">Find 2+ Listings</button>' +
          '<button type="button" class="bs-stop-btn" id="bulk-shopper-stop" disabled>Stop</button>' +
        '</div>' +
        '<div class="bs-actions">' +
          '<button type="button" class="bs-arm-btn" id="bulk-shopper-arm">Arm Auto-Trade</button>' +
        '</div>' +
        '<div class="bs-actions">' +
          '<button type="button" class="bs-save-btn" id="bulk-shopper-save">Save</button>' +
          '<select class="bs-load-select" id="bulk-shopper-load" title="Load search">' +
            '<option value="">Load search...</option>' +
          '</select>' +
          '<button type="button" class="bs-delete-btn" id="bulk-shopper-delete" disabled title="Delete selected search">&times;</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(widget);
    this.bind(widget);
  },

  bind: function (widget) {
    var statusEl = widget.querySelector('#bulk-shopper-status');
    var findBtn = widget.querySelector('#bulk-shopper-find');
    var stopBtn = widget.querySelector('#bulk-shopper-stop');
    var armBtn = widget.querySelector('#bulk-shopper-arm');
    var toggleBtn = widget.querySelector('#bulk-shopper-toggle');
    var saveBtn = widget.querySelector('#bulk-shopper-save');
    var loadSelect = widget.querySelector('#bulk-shopper-load');
    var deleteBtn = widget.querySelector('#bulk-shopper-delete');
    var bulk = ShoppingTools.bulkFind;
    var arm = ShoppingTools.liveArm;
    var saved = ShoppingTools.savedSearches;

    function setStatus(text, type) {
      statusEl.textContent = text;
      statusEl.className = 'bs-status' + (type ? ' bs-' + type : '');
    }

    function setScanning(active) {
      bulk.scanning = active;
      findBtn.disabled = active || arm.isLiveActive();
      stopBtn.disabled = !active;
      armBtn.disabled = active;
    }

    function syncArmUi(message, type) {
      if (arm.isLiveActive()) {
        widget.classList.add('bs-armed');
        armBtn.textContent = arm.armed ? 'Armed' : 'Watching';
        armBtn.classList.add('bs-armed-btn');
        findBtn.disabled = true;
        setStatus(message || 'Armed. Waiting for new listings…');
      } else {
        widget.classList.remove('bs-armed');
        armBtn.textContent = 'Arm';
        armBtn.classList.remove('bs-armed-btn');
        findBtn.disabled = bulk.scanning;
        if (message) {
          setStatus(message, type || '');
        }
      }
    }

    arm.onChange = syncArmUi;

    function refreshLoadSelect() {
      return saved.getAll().then(function (searches) {
        var current = saved.normalizeUrl(location.href);
        loadSelect.innerHTML = '';
        var placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = searches.length ? 'Load search...' : 'No saved searches';
        loadSelect.appendChild(placeholder);

        searches.forEach(function (search, index) {
          var option = document.createElement('option');
          option.value = String(index);
          option.textContent = search.name;
          if (search.url === current) {
            option.selected = true;
          }
          loadSelect.appendChild(option);
        });

        deleteBtn.disabled = loadSelect.value === '';
      });
    }

    saveBtn.addEventListener('click', async function () {
      if (!saved.isTradeSearchUrl(location.href)) {
        setStatus('Open a trade search URL first.', 'error');
        return;
      }

      var url = saved.normalizeUrl(location.href);
      var name = await saved.nameFromUrl(location.href);
      saved.getAll().then(function (searches) {
        var exists = searches.some(function (search) {
          return search.url === url;
        });
        if (exists) {
          setStatus('Search already saved: ' + name, 'error');
          return refreshLoadSelect();
        }
        searches.push({ name: name, url: url, savedAt: Date.now() });
        return saved.setAll(searches).then(function () {
          return refreshLoadSelect();
        }).then(function () {
          setStatus('Saved ' + name, 'success');
        });
      });
    });

    loadSelect.addEventListener('change', function () {
      deleteBtn.disabled = loadSelect.value === '';
      if (loadSelect.value === '') {
        return;
      }
      saved.getAll().then(function (searches) {
        var search = searches[Number(loadSelect.value)];
        if (!search) {
          return;
        }
        if (saved.normalizeUrl(location.href) === search.url) {
          setStatus('Already on ' + search.name);
          return;
        }
        location.assign(search.url);
      });
    });

    deleteBtn.addEventListener('click', function () {
      if (loadSelect.value === '') {
        return;
      }
      var index = Number(loadSelect.value);
      saved.getAll().then(function (searches) {
        var removed = searches.splice(index, 1)[0];
        return saved.setAll(searches).then(function () {
          return refreshLoadSelect();
        }).then(function () {
          setStatus(removed ? 'Deleted ' + removed.name : 'Deleted search', 'success');
        });
      });
    });

    toggleBtn.addEventListener('click', function () {
      widget.classList.toggle('bs-collapsed');
    });

    stopBtn.addEventListener('click', function () {
      if (bulk.abortController) {
        bulk.abortController.abort();
      }
    });

    armBtn.addEventListener('click', function () {
      if (bulk.scanning) {
        return;
      }
      if (arm.isLiveActive()) {
        arm.disarm('Disarmed.', 'error');
        return;
      }
      arm.arm();
    });

    findBtn.addEventListener('click', function () {
      if (bulk.scanning) {
        return;
      }
      if (ShoppingTools.dom.getResultRows().length === 0) {
        setStatus('No results visible. Run a search first.', 'error');
        return;
      }

      bulk.abortController = new AbortController();
      setScanning(true);
      setStatus('Starting scan…');

      bulk.findFirstBulkSeller(bulk.abortController.signal, setStatus).then(function (result) {
        if (result.found) {
          setStatus('Teleporting to ' + result.account + ' (' + result.count + ' listings).', 'success');
        } else if (result.reason === 'no_seller_found') {
          setStatus('No seller with 2+ listings found in these results.', 'error');
        } else {
          setStatus('Scan stopped.', 'error');
        }
      }).catch(function (error) {
        if (error.name !== 'AbortError') {
          setStatus('Error: ' + error.message, 'error');
        } else {
          setStatus('Scan stopped.', 'error');
        }
      }).then(function () {
        bulk.abortController = null;
        setScanning(false);
      });
    });

    refreshLoadSelect();
  }
};
