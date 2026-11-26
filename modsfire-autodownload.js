modsfire-autodownload.js text/javascript
(function() {
    'use strict';
    if (window.top !== window.self) return;
    if (!/(^|\.)modsfire\.com$/.test(location.hostname)) return;
    function init() {
        if (!document.body) return;
        window.mfAutoDownload?.stop();
        const completed = new Set();
        let pending = null;
        const normalize = text =>
            text.replace(/\s+/g, ' ').trim().toLowerCase();
        function ready(el) {
            if (!el || !el.getClientRects().length) return false;
            if (el.hasAttribute('disabled')) return false;
            if (el.getAttribute('aria-disabled') === 'true') return false;
            const style = getComputedStyle(el);
            return style.visibility === 'visible' &&
                style.pointerEvents !== 'none' &&
                style.cursor !== 'not-allowed';
        }
        function scan() {
            pending = null;
            const path = location.pathname;
            const finalPage = /^\/download\/[^/]+\/[^/]+\/?$/.test(path);
            const filePage = /^\/[a-zA-Z0-9]+\/?$/.test(path);
            if (!finalPage && !filePage) return;
            const buttons = document.querySelectorAll('a.download-button');
            for (const button of buttons) {
                if (!ready(button)) continue;
                const text = normalize(button.textContent || '');
                const href = button.getAttribute('href') || '';
                let stage;
                if (filePage &&
                    text === 'generate link' &&
                    !href) {
                    stage = 'Generate Link';
                } else if (filePage &&
                    text === 'download link' &&
                    href.startsWith('/download/')) {
                    stage = 'Download Link';
                } else if (finalPage &&
                    text === 'download' &&
                    button.id === 'downloadnow' &&
                    href.startsWith('/d/')) {
                    stage = 'Download';
                } else {
                    continue;
                }
                if (completed.has(stage)) continue;
                completed.add(stage);
                console.log('[MF Auto] Clicking ' + stage);
                button.click();
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
                'id',
                'href',
                'class',
                'style',
                'hidden',
                'disabled',
                'aria-disabled'
            ]
        });
        window.mfAutoDownload = {
            stop() {
                observer.disconnect();
                clearTimeout(pending);
                pending = null;
            }
        };
        console.log('[MF Auto] v1.1 Enabled');
        schedule();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, {once: true});
    } else {
        init();
    }
})();
