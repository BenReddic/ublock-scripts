/// flightsim-autodownload.js
(function() {
    'use strict';

    if (!/(^|\.)flightsim\.to$/.test(location.hostname)) return;

    window.fsAutoDownload?.stop();

    const clicked = new WeakSet();

    const visible = el =>
        el.getClientRects().length > 0 &&
        getComputedStyle(el).visibility !== 'hidden' &&
        getComputedStyle(el).display !== 'none';

    const normalize = text =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();

    function scan() {
        if (!document.body) return;

        // Preserve third-party security warnings.
        if (document.body.innerText.includes('Third-Party Application')) return;

        const buttons = [...document.querySelectorAll(
            'button, [role="button"], a'
        )].filter(visible);

        for (const button of buttons) {
            if (
                clicked.has(button) ||
                button.disabled ||
                button.getAttribute('aria-disabled') === 'true'
            ) continue;

            const text = normalize(button.innerText || '');

            const dialog = button.closest(
                '[role="dialog"], [aria-modal="true"], dialog'
            );

            // Automatically start the download.
            if (text === 'download now') {
                clicked.add(button);
                console.log('[FS Auto] Starting download');
                button.click();
                return;
            }

            // Automatically confirm single-file downloads.
            if (
                text === 'continue' &&
                dialog &&
                dialog.innerText.includes('Select a file to download')
            ) {
                const options = dialog.querySelectorAll(
                    'input[type="radio"], [role="radio"]'
                );

                if (options.length !== 1) continue;

                clicked.add(button);
                console.log('[FS Auto] Continuing with single file');
                button.click();
                return;
            }
        }
    }

    function start() {
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
                console.log('[FS Auto] Disabled');
            }
        };

        console.log('[FS Auto] Enabled via uBlock Origin');
        scan();
    }

    if (document.body) {
        start();
    } else {
        document.addEventListener(
            'DOMContentLoaded', start, { once: true }
        );
    }
})();

