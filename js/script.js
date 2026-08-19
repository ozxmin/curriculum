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
