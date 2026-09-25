// The /join/{CODE} landing, shared by join/index.html and 404.html (GitHub
// Pages serves 404.html for /join/{CODE}, which has no file behind it).
//
// Codes are 6 chars, no 0 O 1 I; the app and the functions normalise the
// same way (uppercase, strip spaces and dashes).
//
// The page says who is inviting (previewCode), offers "Open in Allowance"
// for a device that has the app, and copies the join link when
// "Get Allowance on the App Store" is tapped. On its first launch the app
// offers that link back through the system Paste button, so the code
// survives the trip through the App Store.
(function () {
  var PREVIEW_URL = 'https://us-central1-allowance-app-5bbfd.cloudfunctions.net/previewCode';

  function el(id) { return document.getElementById(id); }

  function codeFromPath() {
    var parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
    var raw = parts[0] === 'join' && parts.length >= 2 ? parts[1] : '';
    var code = decodeURIComponent(raw).toUpperCase().replace(/[\s-]/g, '');
    return /^[A-HJ-NP-Z2-9]{6}$/.test(code) ? code : null;
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }

  function showPreview(preview) {
    if (preview.role === 'child') {
      el('title').textContent = 'Set up ' + preview.childName + "'s device";
      el('subtitle').textContent = 'Read-only, no account needed. Open Allowance on the device ' +
        preview.childName + ' will use and enter this code.';
    } else {
      el('title').textContent = preview.inviterName + ' invited you to ' + preview.familyName;
      el('subtitle').textContent = 'Open Allowance and enter this code to share every kid and every balance. It works once, then stops.';
    }
  }

  function showUsed() {
    el('title').textContent = 'This code has already been used';
    el('subtitle').textContent = "Or it isn't right. Ask for a fresh one.";
    el('code').hidden = true;
    el('open-btn').hidden = true;
    el('copy-note').hidden = true;
  }

  window.renderJoin = function () {
    var code = codeFromPath();
    if (!code) {
      el('subtitle').textContent =
        'This code looks incomplete. Ask the grown-up who shared it to send a new one.';
      return;
    }

    var link = 'https://getallowance.app/join/' + code;
    el('code').textContent = code;
    el('code').hidden = false;
    // The custom scheme, not https: iOS never opens the app for a
    // same-domain link tapped in Safari, so an https:// href would reload.
    el('open-btn').href = 'allowance://join/' + code;
    el('open-btn').hidden = false;
    el('copy-note').hidden = false;

    // Copying needs a tap in Safari, so the store link copies first and
    // then follows itself.
    var store = el('store-btn');
    store.addEventListener('click', function (event) {
      event.preventDefault();
      var go = function () { window.location.href = store.href; };
      copy(link).then(go, go);
      setTimeout(go, 600);
    });

    fetch(PREVIEW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { code: code } })
    })
      .then(function (response) { return response.json(); })
      .then(function (body) {
        if (body && body.result) {
          showPreview(body.result);
        } else if (body && body.error && body.error.status === 'NOT_FOUND') {
          showUsed();
        }
        // Anything else (offline, the function down): keep the generic copy.
      })
      .catch(function () {});
  };
})();
