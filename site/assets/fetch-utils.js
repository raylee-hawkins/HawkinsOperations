(function (root) {
  function toTimeout(value) {
    var n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 1500;
    return Math.round(n);
  }

  function fetchJsonWithTimeout(url, options) {
    var config = options || {};
    var timeoutMs = toTimeout(config.timeoutMs);
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = root.setTimeout(function () {
      if (controller) controller.abort();
    }, timeoutMs);

    return root
      .fetch(url, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status + " for " + url);
        return response.json();
      })
      .catch(function () {
        return null;
      })
      .finally(function () {
        root.clearTimeout(timer);
      });
  }

  root.fetchJsonWithTimeout = fetchJsonWithTimeout;
})(window);
