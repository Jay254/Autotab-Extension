function createGhostOverlay(textarea) {
  const ghost = document.createElement('div');
  const style = getComputedStyle(textarea);

  Object.assign(ghost.style, {
    position: 'absolute',
    top: `${textarea.offsetTop}px`,
    left: `${textarea.offsetLeft}px`,
    width: `${textarea.offsetWidth}px`,
    height: `${textarea.offsetHeight}px`,
    font: style.font,
    color: 'gray',
    opacity: 0.5,
    pointerEvents: 'none',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    padding: style.padding,
    zIndex: 9999
  });

  textarea.parentNode.appendChild(ghost);
  return ghost;
}

function handleTextarea(textarea) {
  const ghost = createGhostOverlay(textarea);
  let suggestion = '';

  textarea.addEventListener('input', async () => {
    const value = textarea.value;

    if (value.length > 5) {
      try {
        const res = await fetch('http://localhost:3000/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: value })
        });

        const data = await res.json();
        suggestion = data.completion;
        ghost.textContent = value + suggestion;
      } catch (err) {
        console.error('Autocomplete fetch failed:', err);
        ghost.textContent = '';
        suggestion = '';
      }
    } else {
      ghost.textContent = '';
      suggestion = '';
    }
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      textarea.value += suggestion;
      ghost.textContent = textarea.value;
      suggestion = '';
    }
  });
}

function findAndHookTextareas() {
  const textareas = document.querySelectorAll('textarea:not([data-autotab-hooked])');
  textareas.forEach((ta) => {
    handleTextarea(ta);
    ta.setAttribute('data-autotab-hooked', 'true');
  });
}

window.addEventListener('load', findAndHookTextareas);

const observer = new MutationObserver(findAndHookTextareas);
observer.observe(document.body, { childList: true, subtree: true });
