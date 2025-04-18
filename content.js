function handleTextarea(textarea) {
    textarea.addEventListener('input', (e) => {
      console.log('User typed:', textarea.value);
    });
  }
  
  function findAndHookTextareas() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(handleTextarea);
  }
  
  // Run on page load
  window.addEventListener('load', findAndHookTextareas);
  
  // Run again if new elements are added later
  const observer = new MutationObserver(findAndHookTextareas);
  observer.observe(document.body, { childList: true, subtree: true });