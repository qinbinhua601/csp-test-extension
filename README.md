# CSP Trigger Extension (Demo)

This extension injects external HTTPS resources into:
- https://example.com/

The page CSP includes (key parts):
- script-src 'strict-dynamic' 'nonce-...'
- connect-src 'self' https: http:
- font-src 'self' data: https:
- default-src 'self'

So the extension triggers violations by:
- loading a third-party script without nonce/hash (script-src violation)
- sending an anchor ping to wss://... (connect-src violation)
- loading a blob: font via @font-face (font-src violation)
- loading third-party/data-scheme iframes (frame/default-src violation)

## Load in Chrome

1. Open Chrome and go to: chrome://extensions
2. Enable Developer mode (top-right).
3. Click "Load unpacked".
4. Select this folder:
   - csp-test-extension

## Verify

1. Open https://example.com/
2. Open DevTools Console and Network.
3. Look for CSP errors similar to:
   - Refused to load the script 'https://example.com/evil.js' because it violates script-src
   - Refused to connect to 'wss://example.com/ping' because it violates connect-src
   - Refused to load the font 'blob:...' because it violates font-src
   - Refused to frame 'https://example.com/' or 'data:...' because it violates frame-src/default-src

If your site has CSP reporting enabled, expected pattern is:
- documentURL: your page URL
- blockedURL: https://example.com/... (third-party)
- sourceFile: may be your page URL, your app bundle URL, extension URL, or empty (browser-dependent)

## Notes

- This is for security testing in your own environment.
- Behavior can vary by browser version and CSP report format (report-uri vs report-to).
