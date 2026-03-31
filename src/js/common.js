(async function () {
  const scriptTag = document.querySelector('script[data-tool-script]');
  if (!scriptTag) return;

  const toolPath = scriptTag.getAttribute('data-tool-script');
  const toolModule = await import(toolPath);
  const tool = toolModule.default;

  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const actionBar = document.getElementById('action-bar');
  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');
  const btnSwap = document.getElementById('btn-swap');

  // Run on init if tool has init function (MUST run before button creation)
  if (tool.init) {
    tool.init({ inputEl, outputEl, actionBar });
  }

  // Create action buttons from tool definition
  tool.actions.forEach((action) => {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = action.label;
    btn.addEventListener('click', async () => {
      try {
        const result = await action.fn(inputEl.value);
        if (tool.customRender) {
          tool.customRender(result, outputEl);
        } else {
          outputEl.value = result;
          outputEl.classList.remove('error');
        }
      } catch (err) {
        if (tool.customRender) {
          outputEl.textContent = 'Error: ' + err.message;
        } else {
          outputEl.value = 'Error: ' + err.message;
          outputEl.classList.add('error');
        }
      }
    });
    actionBar.appendChild(btn);
  });

  // Copy output to clipboard
  btnCopy.addEventListener('click', () => {
    const text = tool.customRender ? outputEl.textContent : outputEl.value;
    navigator.clipboard.writeText(text);
    btnCopy.textContent = 'Copied!';
    setTimeout(() => (btnCopy.textContent = 'Copy'), 1500);
  });

  // Clear both panels
  btnClear.addEventListener('click', () => {
    inputEl.value = '';
    if (tool.customRender) {
      outputEl.textContent = '';
    } else {
      outputEl.value = '';
      outputEl.classList.remove('error');
    }
  });

  // Swap input and output
  btnSwap.addEventListener('click', () => {
    const text = tool.customRender ? outputEl.textContent : outputEl.value;
    if (tool.customRender) {
      outputEl.textContent = inputEl.value;
    } else {
      outputEl.value = inputEl.value;
    }
    inputEl.value = text;
  });
})();
