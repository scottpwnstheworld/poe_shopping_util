(function () {
  ShoppingTools.liveArm.start();
  if (window === window.top) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        ShoppingTools.widget.create();
      }, { once: true });
    } else {
      ShoppingTools.widget.create();
    }
  }
})();
