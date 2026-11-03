/**
 * ==========================================================================
 * GUT ALTONA - CENTRALIZED PREVIEW MODE CONTROLLER
 * ==========================================================================
 * PREVIEW_MODE = true: All user-triggered navigation and actions are blocked.
 * PREVIEW_MODE = false: Original website interactions are restored.
 * ==========================================================================
 */

(function () {
  'use strict';

  // Prevent duplicate execution if script is loaded multiple times
  if (window.__GUT_ALTONA_PREVIEW_SYS_INITIALIZED__) {
    return;
  }
  window.__GUT_ALTONA_PREVIEW_SYS_INITIALIZED__ = true;

  // Internal state
  var _PREVIEW_MODE = true;

  /**
   * 1. LOCK ALL LINKS & FORMS IN THE DOM
   * Temporarily moves active href, action, onsubmit, and onclick attributes
   * into data-original-* attributes so no browser gesture, middle click,
   * or mobile touch can ever trigger navigation or submission.
   */
  function lockAllLinks() {
    if (!_PREVIEW_MODE) return;

    // Anchor tags
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute('href');
      if (href && href !== 'javascript:void(0);' && href !== 'javascript:void(0)') {
        a.setAttribute('data-original-href', href);
        a.setAttribute('href', 'javascript:void(0);');
      }
    }

    // Forms
    var forms = document.querySelectorAll('form');
    for (var j = 0; j < forms.length; j++) {
      var form = forms[j];
      var action = form.getAttribute('action');
      if (action && action !== 'javascript:void(0);') {
        form.setAttribute('data-original-action', action);
        form.setAttribute('action', 'javascript:void(0);');
      }
      var onsubmit = form.getAttribute('onsubmit');
      if (onsubmit && onsubmit !== 'return false;') {
        form.setAttribute('data-original-onsubmit', onsubmit);
        form.setAttribute('onsubmit', 'return false;');
      }
    }

    // Elements with inline onclick
    var clickables = document.querySelectorAll('[onclick]');
    for (var k = 0; k < clickables.length; k++) {
      var el = clickables[k];
      var onclick = el.getAttribute('onclick');
      if (onclick && onclick !== 'return false;') {
        el.setAttribute('data-original-onclick', onclick);
        el.setAttribute('onclick', 'return false;');
      }
    }
  }

  /**
   * 2. RESTORE ALL ORIGINAL DESTINATIONS
   * Restores original href, action, onsubmit, and onclick attributes
   * when PREVIEW_MODE is set to false.
   */
  function unlockAllLinks() {
    // Restore Anchors
    var lockedAnchors = document.querySelectorAll('a[data-original-href]');
    for (var i = 0; i < lockedAnchors.length; i++) {
      var a = lockedAnchors[i];
      var origHref = a.getAttribute('data-original-href');
      if (origHref) {
        a.setAttribute('href', origHref);
        a.removeAttribute('data-original-href');
      }
    }

    // Restore Forms
    var lockedForms = document.querySelectorAll('form[data-original-action], form[data-original-onsubmit]');
    for (var j = 0; j < lockedForms.length; j++) {
      var form = lockedForms[j];
      var origAction = form.getAttribute('data-original-action');
      if (origAction) {
        form.setAttribute('action', origAction);
        form.removeAttribute('data-original-action');
      }
      var origOnsubmit = form.getAttribute('data-original-onsubmit');
      if (origOnsubmit) {
        form.setAttribute('onsubmit', origOnsubmit);
        form.removeAttribute('data-original-onsubmit');
      }
    }

    // Restore Onclick
    var lockedClickables = document.querySelectorAll('[data-original-onclick]');
    for (var k = 0; k < lockedClickables.length; k++) {
      var el = lockedClickables[k];
      var origOnclick = el.getAttribute('data-original-onclick');
      if (origOnclick) {
        el.setAttribute('onclick', origOnclick);
        el.removeAttribute('data-original-onclick');
      }
    }
  }

  /**
   * 3. CAPTURE-PHASE EVENT INTERCEPTOR
   * Intercepts click, auxclick, dblclick at the earliest stage.
   */
  function handleCaptureEvent(e) {
    if (!_PREVIEW_MODE) return;

    var target = e.target;
    if (!target || !(target instanceof Element)) return;

    var interactive = target.closest(
      'a, button, input[type="submit"], input[type="button"], input[type="reset"], input[type="image"], [role="button"], [role="link"], [data-modal-open], [data-modal-close], .cta, .btn, .rooms-btn, .editorial-room-btn, .mosaic-card, .usb-card, .card--room, .menu-button, label[for="global-toggle-menu"]'
    );

    if (interactive) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  /**
   * 4. KEYBOARD ACTIVATION INTERCEPTOR (Enter & Space)
   */
  function handleKeydownCapture(e) {
    if (!_PREVIEW_MODE) return;

    var isActivationKey = (
      e.key === 'Enter' ||
      e.key === ' ' ||
      e.key === 'Spacebar' ||
      e.keyCode === 13 ||
      e.keyCode === 32
    );

    if (!isActivationKey) return;

    var activeEl = document.activeElement;
    if (activeEl) {
      var tag = activeEl.tagName.toLowerCase();
      // Allow typing inside normal text inputs and textareas
      if (tag === 'textarea') return;
      if (tag === 'input' && !['submit', 'button', 'reset', 'image', 'checkbox', 'radio'].includes(activeEl.type)) {
        return;
      }
    }

    var target = e.target;
    if (!target || !(target instanceof Element)) return;

    var interactive = target.closest(
      'a, button, input[type="submit"], input[type="button"], [role="button"], [role="link"], .cta, .btn'
    );

    if (interactive) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  /**
   * 5. FORM SUBMISSION INTERCEPTOR
   */
  function handleSubmitCapture(e) {
    if (!_PREVIEW_MODE) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  /**
   * 6. GUARD PROGRAMMATIC NAVIGATION & POPUPS
   */
  var origWindowOpen = window.open;
  window.open = function () {
    if (_PREVIEW_MODE) {
      return null;
    }
    return origWindowOpen.apply(this, arguments);
  };

  var origAlert = window.alert;
  window.alert = function () {
    if (_PREVIEW_MODE) {
      return;
    }
    return origAlert.apply(this, arguments);
  };

  var origConfirm = window.confirm;
  window.confirm = function () {
    if (_PREVIEW_MODE) {
      return false;
    }
    return origConfirm.apply(this, arguments);
  };

  var origPrompt = window.prompt;
  window.prompt = function () {
    if (_PREVIEW_MODE) {
      return null;
    }
    return origPrompt.apply(this, arguments);
  };

  // Guard HTMLFormElement submit methods
  if (typeof HTMLFormElement !== 'undefined') {
    var origFormSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      if (_PREVIEW_MODE) return false;
      return origFormSubmit.apply(this, arguments);
    };

    if (HTMLFormElement.prototype.requestSubmit) {
      var origFormReqSubmit = HTMLFormElement.prototype.requestSubmit;
      HTMLFormElement.prototype.requestSubmit = function () {
        if (_PREVIEW_MODE) return false;
        return origFormReqSubmit.apply(this, arguments);
      };
    }
  }

  /**
   * 7. ATTACH CAPTURE LISTENERS ON WINDOW & DOCUMENT
   */
  window.addEventListener('click', handleCaptureEvent, true);
  window.addEventListener('auxclick', handleCaptureEvent, true);
  window.addEventListener('dblclick', handleCaptureEvent, true);
  window.addEventListener('submit', handleSubmitCapture, true);
  window.addEventListener('keydown', handleKeydownCapture, true);

  document.addEventListener('click', handleCaptureEvent, true);
  document.addEventListener('auxclick', handleCaptureEvent, true);
  document.addEventListener('submit', handleSubmitCapture, true);
  document.addEventListener('keydown', handleKeydownCapture, true);

  /**
   * 8. RUN LOCK ON DOM READY & OBSERVE DYNAMIC MUTATIONS
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (_PREVIEW_MODE) lockAllLinks();
    });
  } else {
    if (_PREVIEW_MODE) lockAllLinks();
  }

  // MutationObserver to automatically lock dynamically added elements
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (_PREVIEW_MODE) {
        lockAllLinks();
      }
    });

    var startObserver = function () {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
    };
    startObserver();
  }

  /**
   * 9. DEFINE REACTIVE GLOBAL PREVIEW_MODE GETTER / SETTER
   * PREVIEW_MODE = true: All user-triggered navigation and actions are blocked.
   * PREVIEW_MODE = false: Original website interactions are restored.
   */
  try {
    Object.defineProperty(window, 'PREVIEW_MODE', {
      get: function () {
        return _PREVIEW_MODE;
      },
      set: function (val) {
        _PREVIEW_MODE = Boolean(val);
        if (_PREVIEW_MODE) {
          lockAllLinks();
          console.info('[Gut Altona Preview Mode] LOCKED: All navigation & actions blocked.');
        } else {
          unlockAllLinks();
          console.info('[Gut Altona Preview Mode] UNLOCKED: Original interactions restored.');
        }
      },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    window.PREVIEW_MODE = _PREVIEW_MODE;
  }

  // Also maintain window.GUT_ALTONA_PREVIEW_MODE
  window.GUT_ALTONA_PREVIEW_MODE = {
    get enabled() {
      return _PREVIEW_MODE;
    },
    set enabled(val) {
      window.PREVIEW_MODE = val;
    },
    set: function (bool) {
      window.PREVIEW_MODE = bool;
      return _PREVIEW_MODE;
    }
  };

  // Immediate lock attempt in case body already exists
  if (document.body && _PREVIEW_MODE) {
    lockAllLinks();
  }
})();
