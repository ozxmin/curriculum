function closeAllDisclosure() {
  document.querySelectorAll('.inline-trigger').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });

  document.querySelectorAll('.inline-panel').forEach((panel) => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });
}

function setDisclosureState(button, shouldOpen) {
  const panel = document.getElementById(button.dataset.target);
  if (!panel) return;

  button.setAttribute('aria-expanded', String(shouldOpen));
  panel.classList.toggle('open', shouldOpen);
  panel.setAttribute('aria-hidden', String(!shouldOpen));

  if (shouldOpen) {
    const container = button.closest('.inline-details');
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const left = buttonRect.left - containerRect.left + (button.offsetWidth / 2);
    const top = buttonRect.top - containerRect.top;

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
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

    const container = button.closest('.inline-details');
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    panel.style.left = `${buttonRect.left - containerRect.left + (button.offsetWidth / 2)}px`;
    panel.style.top = `${buttonRect.top - containerRect.top}px`;
  });
});
