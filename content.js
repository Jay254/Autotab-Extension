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
  
    textarea.addEventListener('input', () => {
      const value = textarea.value;
  
      // Placeholder suggestion logic
      if (value.endsWith('I think')) {
        suggestion = ' this extension is fire.';
      } else {
        suggestion = '';
      }
  
      ghost.textContent = value + suggestion;
    });
  
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault();
        textarea.value += suggestion;
        suggestion = '';
        ghost.textContent = textarea.value;
      }
    });
  }
  
  function findAndHookTextareas() {
    const textareas = document.querySelectorAll('textarea:not([data-autotab-hooked])');
    textareas.forEach((textarea) => {
      handleTextarea(textarea);
      textarea.setAttribute('data-autotab-hooked', 'true'); // mark it as hooked
    });
  }
  
  
  window.addEventListener('load', findAndHookTextareas);
  
  const observer = new MutationObserver(findAndHookTextareas);
  observer.observe(document.body, { childList: true, subtree: true });  