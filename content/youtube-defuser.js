/**
 * CleanBlock - YouTube Ad Defuser & Anti-Detection Scriptlet
 * 
 * Unlike commercial ad blockers that surrender and auto-allowlist YouTube,
 * CleanBlock suppresses ads and dismisses enforcement modals directly:
 * 1. Fast-forwards pre-rolls/mid-rolls instantly at 16x speed and skips them in 1 frame.
 * 2. Mutes audio during ad intervals so you hear nothing.
 * 3. Auto-dismisses YouTube's "Ad blockers violate Terms of Service" modal.
 * 4. Automatically resumes video playback.
 */
(() => {
  "use strict";

  function handleYouTubeAds() {
    // 1. Detect if an ad is actively playing
    const moviePlayer = document.getElementById("movie_player");
    const video = document.querySelector("video");

    if (moviePlayer && video) {
      const isAdActive = moviePlayer.classList.contains("ad-showing") || 
                         moviePlayer.classList.contains("ad-interrupting") ||
                         document.querySelector(".ytp-ad-player-overlay");

      if (isAdActive) {
        // Mute video so ad sound is never heard
        video.muted = true;

        // Accelerate playback speed to finish ad instantly
        video.playbackRate = 16.0;

        // Jump straight to the end of the ad
        if (!isNaN(video.duration) && video.duration > 0) {
          video.currentTime = video.duration;
        }

        // Click skip button immediately
        const skipButtons = document.querySelectorAll([
          ".ytp-ad-skip-button",
          ".ytp-ad-skip-button-modern",
          ".ytp-skip-ad-button",
          ".ytp-ad-skip-button-text"
        ].join(","));

        for (const btn of skipButtons) {
          if (btn) {
            btn.click();
            break;
          }
        }
      }
    }

    // 2. Suppress and dismiss the anti-adblock detection modal if it pops up
    const enforcementDialog = document.querySelector([
      "ytd-enforcement-message-view-model",
      "tp-yt-paper-dialog:has(#dismiss-button)",
      "yt-playability-error-supported-renderers"
    ].join(","));

    if (enforcementDialog) {
      // Find dismiss button if available and click it
      const dismissBtn = enforcementDialog.querySelector("#dismiss-button, button");
      if (dismissBtn) {
        dismissBtn.click();
      }

      // Remove the blocking overlay from DOM
      enforcementDialog.remove();

      // Clear dark overlay backdrop if present
      const backdrops = document.querySelectorAll("tp-yt-iron-overlay-backdrop");
      for (const bd of backdrops) {
        bd.remove();
      }

      // Force resume playback
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    }

    // 3. Remove in-feed ad slots and companion banners
    const adElements = document.querySelectorAll([
      "#masthead-ad",
      "ytd-ad-slot-renderer",
      "ytd-banner-promo-renderer",
      "ytd-in-feed-ad-layout-renderer",
      ".ytp-ad-overlay-container",
      ".ytp-ad-message-container"
    ].join(","));

    for (const ad of adElements) {
      ad.remove();
    }
  }

  // Run on tight interval for rapid ad-skip response
  setInterval(handleYouTubeAds, 80);

  // Also hook into DOM ready and load events
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleYouTubeAds, { once: true });
  } else {
    handleYouTubeAds();
  }
})();

