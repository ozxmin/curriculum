function closeAllDisclosure() {
  document.querySelectorAll('.inline-trigger').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });

  document.querySelectorAll('.inline-panel').forEach((panel) => {
    panel.classList.remove('open');
  });
}

function positionBubble(trigger) {
  const panel = document.getElementById(trigger.dataset.target);
  if (!panel) return;

  const parentRect = trigger.parentElement.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const left = triggerRect.left - parentRect.left + (trigger.offsetWidth / 2);
  const top = triggerRect.top - parentRect.top;

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

function toggleDisclosure(trigger) {
  const targetId = trigger.dataset.target;
  const targetPanel = document.getElementById(targetId);
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

  document.querySelectorAll('.inline-trigger').forEach((button) => {
    const buttonPanel = document.getElementById(button.dataset.target);
    const shouldOpen = button === trigger && !isExpanded;

    button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (buttonPanel) {
      buttonPanel.classList.toggle('open', shouldOpen);
      if (shouldOpen) positionBubble(button);
    }
  });

  if (targetPanel) {
    targetPanel.classList.toggle('open', !isExpanded);
    if (!isExpanded) positionBubble(trigger);
  }
}

document.addEventListener('click', (event) => {
  const clickedTrigger = event.target.closest('.inline-trigger');
  const clickedPanel = event.target.closest('.inline-panel');
  const clickedClose = event.target.closest('.inline-panel-close');

  if (clickedClose) {
    closeAllDisclosure();
    return;
  }

  if (!clickedTrigger && !clickedPanel) {
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
    positionBubble(button);
  });
});
