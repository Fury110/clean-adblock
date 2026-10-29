/**
 * CleanBlock - Background Service Worker
 * Event-driven, 0 idle RAM, 0 telemetry.
 */

const ALL_RULESETS = ["easylist", "easyprivacy", "trackers"];

// Initialize storage state on installation
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(["enabled", "blockedTotal"]);
  if (typeof data.enabled === "undefined") {
    await chrome.storage.local.set({ enabled: true, blockedTotal: 0 });
  }
  updateBadge(data.blockedTotal || 0);
});

// Update extension icon badge
function updateBadge(count) {
  if (count <= 0) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }
  const display = count > 999 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
  chrome.action.setBadgeText({ text: display });
  chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
}

// Listen for messages from content scripts and popup UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AD_BLOCKED") {
    chrome.storage.local.get(["blockedTotal"], (data) => {
      const newTotal = (data.blockedTotal || 0) + (message.count || 1);
      chrome.storage.local.set({ blockedTotal: newTotal });
      updateBadge(newTotal);
    });
    return false;
  }

  if (message.type === "TOGGLE_BLOCKING") {
    (async () => {
      const { enabled } = await chrome.storage.local.get(["enabled"]);
      const newState = !enabled;
      await chrome.storage.local.set({ enabled: newState });

      if (newState) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ALL_RULESETS
        });
        chrome.storage.local.get(["blockedTotal"], (data) => {
          updateBadge(data.blockedTotal || 0);
        });
      } else {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ALL_RULESETS
        });
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#6b7280" });
      }

      sendResponse({ enabled: newState });
    })();
    return true; // Keep channel open for async response
  }

  if (message.type === "GET_STATUS") {
    chrome.storage.local.get(["enabled", "blockedTotal"], (data) => {
      sendResponse({
        enabled: data.enabled !== false,
        blockedTotal: data.blockedTotal || 0
      });
    });
    return true;
  }
});
