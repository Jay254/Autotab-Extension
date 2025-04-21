let debounceTimer;
let suggestion = '';

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

  textarea.addEventListener('input', () => {
    const value = textarea.value;
    ghost.textContent = value;

    clearTimeout(debounceTimer);

    const lastChar = value.slice(-1);
    const triggerChars = [' ', '.', ',', '?', '!'];

    // Don't trigger on empty input or after a full stop
    if (!value || value.trim().endsWith('.')) {
      suggestion = '';
      return;
    }

    if (triggerChars.includes(lastChar)) {
      debounceTimer = setTimeout(() => fetchSuggestion(value, ghost, textarea), 300);
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

async function fetchSuggestion(value, ghost, textarea) {
  try {
    const res = await fetch('http://localhost:3000/api/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: value })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let finalSuggestion = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      try {
        const parsed = JSON.parse(chunk);
        if (parsed.completion) {
          finalSuggestion += parsed.completion;
        }
      } catch {
        finalSuggestion += chunk;
      }

      ghost.textContent = textarea.value + finalSuggestion;
    }

    suggestion = finalSuggestion;
  } catch (err) {
    console.error('Autocomplete fetch failed:', err);
    suggestion = '';
  }
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
