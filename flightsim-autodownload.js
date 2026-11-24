flightsim-autodownload.js text/javascript
(function() {
    'use strict';
    if (window.top !== window.self) return;
    if (!/(^|\.)flightsim\.to$/.test(location.hostname)) return;
    console.log('[FS Auto] Resource injected');
    function init() {
        if (!document.body) return;
        window.fsAutoDownload?.stop();
        const clicked = new WeakSet();
        let pending = null;
        const normalize = text =>
            text.replace(/\s+/g, ' ').trim().toLowerCase();
        const visible = el =>
            el.getClientRects().length > 0 &&
            getComputedStyle(el).visibility !== 'hidden' &&
            getComputedStyle(el).display !== 'none';
        function scan() {
            pending = null;
            const buttons = document.querySelectorAll(
                'button, [role="button"], a'
            );
            for (const button of buttons) {
                if (clicked.has(button) ||
                    button.disabled ||
                    button.getAttribute('aria-disabled') === 'true') continue;
                const text = normalize(button.textContent || '');
                if (text !== 'download now' && text !== 'continue') continue;
                if (!visible(button)) continue;
                const dialog = button.closest(
                    '[role="dialog"], [aria-modal="true"], dialog'
                );
                if (text === 'continue') {
                    if (!dialog ||
                        !dialog.textContent.includes('Select a file to download')) continue;
                    const options = dialog.querySelectorAll(
                        'input[type="radio"], [role="radio"]'
                    );
                    if (options.length !== 1) continue;
                }
                if (document.body.innerText.includes('Third-Party Application')) return;
                clicked.add(button);
                console.log(text === 'download now'
                    ? '[FS Auto] Starting download'
                    : '[FS Auto] Continuing with single file');
                button.click();
                schedule();
                return;
            }
        }
        function schedule() {
            if (pending !== null) return;
            pending = setTimeout(scan, 50);
        }
        const observer = new MutationObserver(schedule);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [
                'disabled',
                'aria-disabled',
                'aria-hidden',
                'class',
                'style',
                'hidden',
                'checked',
                'aria-checked'
            ]
        });
        document.addEventListener('click', schedule, true);
        window.fsAutoDownload = {
            stop() {
                observer.disconnect();
                clearTimeout(pending);
                pending = null;
                document.removeEventListener('click', schedule, true);
            }
        };
        console.log('[FS Auto] v1.1 Optimized - Enabled via uBlock Origin');
        schedule();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, {once:true});
    } else {
        init();
    }
})();

