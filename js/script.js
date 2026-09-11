function closeAllDisclosure() {
  document.querySelectorAll('.inline-trigger').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });

  document.querySelectorAll('.inline-panel').forEach((panel) => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });
}

// Panels are translated by -50% on X, so `left` is the panel's centre point.
// Clamp that centre so a trigger near either edge can't push the panel out of
// the container (and off-screen) on narrow viewports.
function positionPanel(button, panel) {
  const container = button.closest('.inline-details');
  if (!container) return;

  const buttonRect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const halfPanel = panel.offsetWidth / 2;
  const centre = buttonRect.left - containerRect.left + (button.offsetWidth / 2);
  const maxCentre = containerRect.width - halfPanel;

  // When the panel is wider than its container there is no valid clamp range;
  // fall back to centring it rather than letting min/max invert.
  const clamped = maxCentre < halfPanel
    ? containerRect.width / 2
    : Math.min(Math.max(centre, halfPanel), maxCentre);

  panel.style.left = `${clamped}px`;
  panel.style.top = `${buttonRect.top - containerRect.top}px`;
}

function setDisclosureState(button, shouldOpen) {
  const panel = document.getElementById(button.dataset.target);
  if (!panel) return;

  button.setAttribute('aria-expanded', String(shouldOpen));
  panel.classList.toggle('open', shouldOpen);
  panel.setAttribute('aria-hidden', String(!shouldOpen));

  if (shouldOpen) {
    positionPanel(button, panel);
  }
}

function toggleDisclosure(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  document.querySelectorAll('.inline-trigger').forEach((trigger) => {
    const shouldOpen = trigger === button && !isExpanded;
    setDisclosureState(trigger, shouldOpen);
  });
}

document.addEventListener('click', (event) => {
  const clickedTrigger = event.target.closest('.inline-trigger');
  const clickedPanel = event.target.closest('.inline-panel');
  const clickedClose = event.target.closest('.inline-panel-close');

  if (clickedClose) {
    closeAllDisclosure();
    return;
  }

  if (clickedTrigger) {
    toggleDisclosure(clickedTrigger);
    return;
  }

  if (!clickedPanel) {
    closeAllDisclosure();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAllDisclosure();
  }
});

document.addEventListener('scroll', () => {
  const activeTrigger = document.querySelector('.inline-trigger[aria-expanded="true"]');
  if (!activeTrigger) return;

  const rect = activeTrigger.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight + 120) {
    closeAllDisclosure();
  }
}, true);

window.addEventListener('resize', () => {
  document.querySelectorAll('.inline-trigger[aria-expanded="true"]').forEach((button) => {
    const panel = document.getElementById(button.dataset.target);
    if (!panel) return;

    positionPanel(button, panel);
  });
});

/* ============================================================
   Skill-tag evidence popover
   A `.tag` button carrying data-ev answers "where did you use this?".
   One shared panel is created lazily rather than one panel per tag —
   ~20 tags would otherwise mean ~20 duplicated markup blocks.
   ============================================================ */
(function () {
  var tags = document.querySelectorAll('.tag[data-ev]');
  if (!tags.length) return;

  // Not role="dialog": nothing here traps focus or is modal, and a dialog with
  // no accessible name announces as an empty one. It is a disclosure whose
  // content is swapped in, so it is wired as a live region the tags control.
  var panel = document.createElement('div');
  panel.id = 'evidence';
  panel.setAttribute('aria-live', 'polite');
  panel.hidden = true;
  panel.innerHTML = '<div class="ev-term"></div><div class="ev-body"></div>';
  document.body.appendChild(panel);

  tags.forEach(function (tag) {
    tag.setAttribute('aria-controls', 'evidence');
  });

  var term = panel.querySelector('.ev-term');
  var body = panel.querySelector('.ev-body');
  var active = null;

  function closeEvidence() {
    if (active) active.setAttribute('aria-expanded', 'false');
    active = null;
    panel.classList.remove('open');
    panel.hidden = true;
  }

  function openEvidence(tag) {
    if (active === tag) { closeEvidence(); return; }
    closeEvidence();

    active = tag;
    tag.setAttribute('aria-expanded', 'true');

    // Expose the live region before filling it. Text written into a region that
    // is still `hidden` is treated as initial content, not an update, and most
    // screen readers stay silent.
    panel.hidden = false;
    term.textContent = tag.textContent.trim();
    body.textContent = tag.dataset.ev;
    panel.classList.add('open');
    place(tag);
  }

  // Clamp to the viewport, and flip below the tag when there is no room above.
  function place(tag) {
    var rect = tag.getBoundingClientRect();
    var w = panel.offsetWidth;
    var h = panel.offsetHeight;
    var left = Math.min(Math.max(8, rect.left + rect.width / 2 - w / 2), window.innerWidth - w - 8);
    var top = rect.top - h - 10;
    if (top < 8) top = rect.bottom + 10;

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  document.addEventListener('click', function (event) {
    var tag = event.target.closest('.tag[data-ev]');
    if (tag) { openEvidence(tag); return; }
    if (!event.target.closest('#evidence')) closeEvidence();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeEvidence();
  });

  // Reposition on scroll rather than closing: the browser's own
  // scroll-into-view on click fires a scroll event *after* the click
  // handler, so closing here would dismiss the panel as it opened.
  // Close only once the tag itself has left the viewport.
  document.addEventListener('scroll', function () {
    if (!active) return;

    var rect = active.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      closeEvidence();
      return;
    }

    place(active);
  }, true);

  window.addEventListener('resize', closeEvidence);
})();

/* ============================================================
   Deep-linked disclosure
   /#job-chop or /#mig-agentic opens that panel instead of scrolling
   to a collapsed heading, so a single claim can be linked directly
   from an application or an email.
   ============================================================ */
(function () {
  function openFromHash() {
    if (!location.hash) return;

    var target;
    try {
      target = document.querySelector(location.hash);
    } catch (error) {
      return; // Not a valid selector — nothing to open.
    }
    if (!target) return;

    var panel = target.matches('details') ? target : target.querySelector('details');
    if (panel) panel.open = true;
  }

  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();

/* ============================================================
   Print: expand everything
   Saving the page as a PDF is the most likely thing a visitor does
   with a CV. A collapsed <details> would silently drop its content
   from that PDF, so open them all for the print and restore after.
   ============================================================ */
(function () {
  var reopened = [];

  window.addEventListener('beforeprint', function () {
    reopened = [];
    document.querySelectorAll('details:not([open])').forEach(function (panel) {
      panel.open = true;
      reopened.push(panel);
    });
  });

  window.addEventListener('afterprint', function () {
    reopened.forEach(function (panel) { panel.open = false; });
    reopened = [];
  });
})();

/* ============================================================
   Diagram lightbox
   The pipeline figure renders at prose width, too small to read its
   11px labels, so clicking it opens the same <picture> at its 1080px
   design size over the page.

   A click must never navigate. Cancelling the event is not enough on
   its own — Safari was observed opening the overlay and then following
   the link anyway — so once this script runs the href is moved to a
   data attribute and the anchor becomes a button. With no href there
   is nothing left to navigate to, whatever the browser does with the
   event. The markup keeps a real href so the diagram is still
   reachable with JavaScript off; new-tab clicks are reimplemented
   explicitly below. <dialog> is used where available for its focus
   trap and top-layer stacking, with a positioned fallback.
   ============================================================ */
(function () {
  var link = document.querySelector('.diagram-zoom');
  if (!link) return;

  var thumb = link.querySelector('img');
  var scheme = window.matchMedia('(prefers-color-scheme: dark)');
  var dialog = null;
  var closeBtn = null;

  // Keep the full-size target in a data attribute. A lazy image may finish
  // loading either side of this script running, and currentSrc is empty until
  // it does, so re-resolve it whenever it changes.
  var fullSrc = link.getAttribute('href');

  function syncSrc() {
    if (thumb.currentSrc) fullSrc = thumb.currentSrc;
    link.setAttribute('data-full', fullSrc);
  }

  syncSrc();
  thumb.addEventListener('load', syncSrc);
  link.addEventListener('pointerdown', syncSrc);
  if (scheme.addEventListener) scheme.addEventListener('change', syncSrc);

  // Neutralise the anchor. This is the whole point: no href, no navigation.
  link.removeAttribute('href');
  link.setAttribute('role', 'button');
  link.setAttribute('tabindex', '0');

  function onKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay();
    }
  }

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'ios-arch-kit pipeline diagram, full size');

    var scroll = document.createElement('div');
    scroll.className = 'lightbox-scroll';

    // Clone the thumbnail's <picture> rather than repeating the markup, so
    // the light/dark <source> lives in exactly one place.
    var art = link.querySelector('picture').cloneNode(true);
    art.querySelector('img').removeAttribute('loading');
    scroll.appendChild(art);

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close the diagram');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closeOverlay);

    dialog.appendChild(scroll);
    dialog.appendChild(closeBtn);

    // The dialog box is only visible as the area around the scroll pane, so a
    // click landing on it — rather than on the artwork — is a backdrop click.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeOverlay();
    });

    // Escape is handled here as well as by the UA, so the fallback path and
    // the native one behave identically.
    dialog.addEventListener('keydown', onKey);

    document.body.appendChild(dialog);
  }

  function openOverlay() {
    if (!dialog) build();

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      // No <dialog> support: position it ourselves rather than let the click
      // fall through to a navigation.
      dialog.classList.add('is-fallback');
      dialog.setAttribute('open', '');
      document.addEventListener('keydown', onKey);
    }

    if (closeBtn) closeBtn.focus();
  }

  function closeOverlay() {
    if (!dialog) return;

    if (typeof dialog.close === 'function' && dialog.open && !dialog.classList.contains('is-fallback')) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }

    dialog.classList.remove('is-fallback');
    document.removeEventListener('keydown', onKey);
    link.focus();
  }

  link.addEventListener('click', function (event) {
    event.preventDefault();

    // The anchor no longer has an href, so "open in new tab" has to be
    // reimplemented rather than left to the browser.
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      window.open(fullSrc, '_blank', 'noopener');
      return;
    }

    openOverlay();
  });

  // role="button" means the keyboard contract is ours to honour too.
  link.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      openOverlay();
    }
  });

  // Middle-click: no href, so open the new tab explicitly.
  link.addEventListener('auxclick', function (event) {
    if (event.button !== 1) return;
    event.preventDefault();
    window.open(fullSrc, '_blank', 'noopener');
  });
})();
