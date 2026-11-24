flightsim-autodownload.js text/javascript
(function() {
    'use strict';
    console.log('[FS Auto] Resource injected');
    if (!/(^|\.)flightsim\.to$/.test(location.hostname)) return;
    function init() {
        if (!document.body) return;
        window.fsAutoDownload?.stop();
        const clicked = new WeakSet();
        const visible = el => el.getClientRects().length > 0 &&
            getComputedStyle(el).visibility !== 'hidden' &&
            getComputedStyle(el).display !== 'none';
        const normalize = text => text.replace(/\s+/g, ' ').trim().toLowerCase();
        function scan() {
            if (!document.body) return;
            if (document.body.innerText.includes('Third-Party Application')) return;
            const buttons = [...document.querySelectorAll('button, [role="button"], a')].filter(visible);
            for (const button of buttons) {
                if (clicked.has(button) || button.disabled || button.getAttribute('aria-disabled') === 'true') continue;
                const text = normalize(button.innerText || '');
                const dialog = button.closest('[role="dialog"], [aria-modal="true"], dialog');
                if (text === 'download now') {
                    clicked.add(button);
                    console.log('[FS Auto] Starting download');
                    button.click();
                    return;
                }
                if (text === 'continue' && dialog && dialog.innerText.includes('Select a file to download')) {
                    const options = dialog.querySelectorAll('input[type="radio"], [role="radio"]');
                    if (options.length !== 1) continue;
                    clicked.add(button);
                    console.log('[FS Auto] Continuing with single file');
                    button.click();
                    return;
                }
            }
        }
        const observer = new MutationObserver(scan);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
        const timer = setInterval(scan, 250);
        window.fsAutoDownload = {
            stop() {
                observer.disconnect();
                clearInterval(timer);
            }
        };
        console.log('[FS Auto] Enabled via uBlock Origin');
        scan();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, {once:true});
    } else {
        init();
    }
})();

