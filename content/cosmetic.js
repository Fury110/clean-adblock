/**
 * CleanBlock - Lightweight In-Page Cosmetic Ad Remover
 * Zero tracking, zero telemetry.
 */
(() => {
  "use strict";

  const AD_SELECTORS = [
    ".adsbygoogle",
    "[id^='google_ads_']",
    "[id^='div-gpt-ad']",
    ".ad-container",
    ".ad-slot",
    ".ad-banner",
    ".advertisement",
    "#cts_test",
    ".textads",
    ".banner_ads",
    ".adbox",
    ".ADBox",
    ".adSocial",
    "[aria-label*='ShockVPN']",
    "ytd-ad-slot-renderer",
    "ytd-banner-promo-renderer"
  ];

  let blockedInThisPage = 0;

  function sweepAds() {
    try {
      const elements = document.querySelectorAll(AD_SELECTORS.join(","));
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el && el.style.display !== "none") {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("height", "0", "important");
          blockedInThisPage++;
        }
      }
      if (blockedInThisPage > 0) {
        chrome.runtime?.sendMessage({ type: "AD_BLOCKED", count: blockedInThisPage }).catch(() => {});
        blockedInThisPage = 0;
      }
    } catch (_) {}
  }

  // Initial pass
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sweepAds, { once: true });
  } else {
    sweepAds();
  }

  // Lightweight observer for dynamically inserted ads
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      sweepAds();
    }, 100);
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });
})();
