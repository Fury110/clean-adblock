/**
 * CleanBlock - YouTube Main-World Player Sanitizer
 * Runs directly in the page's execution context (world: "MAIN") at document_start.
 * 
 * Intercepts YouTube's player response data before the video player initializes.
 * Strips all adPlacement, playerAd, and adSlot definitions so the player thinks
 * the video has zero ad breaks. Video starts at 0:00 with zero flash & zero skip buttons.
 */
(() => {
  "use strict";

  const AD_PROPERTIES = [
    "adPlacements",
    "adSlots",
    "playerAds",
    "adBreakHeartbeatParams"
  ];

  function sanitize(obj) {
    if (!obj || typeof obj !== "object") return obj;

    for (let i = 0; i < AD_PROPERTIES.length; i++) {
      const prop = AD_PROPERTIES[i];
      if (prop in obj) {
        delete obj[prop];
      }
    }

    if (obj.playerConfig && obj.playerConfig.ssapConfig) {
      delete obj.playerConfig.ssapConfig;
    }

    if (obj.raw_player_response) {
      sanitize(obj.raw_player_response);
    }

    return obj;
  }

  // 1. Hook window.ytInitialPlayerResponse
  let _ytInitialPlayerResponse = window.ytInitialPlayerResponse;
  Object.defineProperty(window, "ytInitialPlayerResponse", {
    get() {
      return _ytInitialPlayerResponse;
    },
    set(val) {
      _ytInitialPlayerResponse = sanitize(val);
    },
    configurable: true,
    enumerable: true
  });
  if (_ytInitialPlayerResponse) {
    sanitize(_ytInitialPlayerResponse);
  }

  // 2. Hook window.ytplayer (used on desktop watch pages)
  let _ytplayer = window.ytplayer;
  Object.defineProperty(window, "ytplayer", {
    get() {
      return _ytplayer;
    },
    set(val) {
      _ytplayer = val;
      if (val && val.config && val.config.args) {
        if (typeof val.config.args.raw_player_response === "string") {
          try {
            const parsed = JSON.parse(val.config.args.raw_player_response);
            sanitize(parsed);
            val.config.args.raw_player_response = JSON.stringify(parsed);
          } catch (_) {}
        } else if (val.config.args.raw_player_response) {
          sanitize(val.config.args.raw_player_response);
        }
      }
    },
    configurable: true,
    enumerable: true
  });

  // 3. Intercept window.fetch for /youtubei/v1/player (used during SPA navigation)
  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url ? args[0].url : "");
    const response = await origFetch.apply(this, args);

    if (typeof url === "string" && (url.includes("/youtubei/v1/player") || url.includes("/youtubei/v1/browse"))) {
      try {
        const clone = response.clone();
        const json = await clone.json();
        sanitize(json);

        return new Response(JSON.stringify(json), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (_) {
        return response;
      }
    }

    return response;
  };

  // 4. Intercept JSON.parse for any inline or dynamically unpacked responses
  const origParse = JSON.parse;
  JSON.parse = function(...args) {
    const result = origParse.apply(this, args);
    if (result && typeof result === "object") {
      if ("adPlacements" in result || "adSlots" in result || "playerAds" in result) {
        sanitize(result);
      }
    }
    return result;
  };

  // 5. Neutering ad tracking cookies & identifier requests
  if (!window.yt) window.yt = {};
  if (!window.yt.ads) window.yt.ads = {};
  if (!window.yt.ads.biscotti) window.yt.ads.biscotti = {};
  window.yt.ads.biscotti.getId_ = () => undefined;
  window.yt.ads.biscotti.lastId_ = () => undefined;
})();

