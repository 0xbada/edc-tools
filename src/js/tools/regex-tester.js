export default {
  customRender: true,
  actions: [],
  init({ inputEl, outputEl, actionBar }) {
    // Add regex input field and flags to the action bar
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:8px;align-items:center;width:100%;flex-wrap:wrap;';

    const regexInput = document.createElement('input');
    regexInput.type = 'text';
    regexInput.id = 'regex-pattern';
    regexInput.placeholder = 'Enter regex pattern...';
    regexInput.className = 'panel-textarea';
    regexInput.style.cssText = 'flex:1;min-height:auto;padding:8px 12px;font-size:13px;min-width:200px;';

    const flagsInput = document.createElement('input');
    flagsInput.type = 'text';
    flagsInput.id = 'regex-flags';
    flagsInput.placeholder = 'gi';
    flagsInput.value = 'g';
    flagsInput.className = 'panel-textarea';
    flagsInput.style.cssText = 'width:50px;min-height:auto;padding:8px 12px;font-size:13px;text-align:center;';

    const testBtn = document.createElement('button');
    testBtn.className = 'action-btn';
    testBtn.textContent = 'Test';

    wrapper.appendChild(regexInput);
    wrapper.appendChild(flagsInput);
    wrapper.appendChild(testBtn);
    actionBar.appendChild(wrapper);

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function runTest() {
      const pattern = regexInput.value;
      const flags = flagsInput.value;
      const text = inputEl.value;

      if (!pattern) {
        outputEl.innerHTML = '<span style="color:var(--text-dim)">Enter a regex pattern above</span>';
        return;
      }

      try {
        const regex = new RegExp(pattern, flags);
        const matches = [];
        let match;
        let matchCount = 0;

        if (flags.includes('g')) {
          while ((match = regex.exec(text)) !== null) {
            matches.push({ index: match.index, length: match[0].length, value: match[0], groups: match.slice(1) });
            matchCount++;
            if (matchCount > 1000) break;
          }
        } else {
          match = regex.exec(text);
          if (match) {
            matches.push({ index: match.index, length: match[0].length, value: match[0], groups: match.slice(1) });
            matchCount = 1;
          }
        }

        // Build highlighted text
        let html = '';
        let lastIndex = 0;
        matches.forEach((m) => {
          html += escapeHtml(text.slice(lastIndex, m.index));
          html += '<span style="background:#4ade8033;color:#4ade80;border-bottom:1px solid #4ade80">';
          html += escapeHtml(text.slice(m.index, m.index + m.length));
          html += '</span>';
          lastIndex = m.index + m.length;
        });
        html += escapeHtml(text.slice(lastIndex));

        // Match summary
        let summary = '<span style="color:var(--text-muted)">' + matchCount + ' match' + (matchCount !== 1 ? 'es' : '') + ' found</span>\n\n';

        outputEl.innerHTML = summary + html;

        // Show capture groups if any
        if (matches.some((m) => m.groups.length > 0)) {
          let groupHtml = '\n\n<span style="color:var(--text-muted)">── Groups ──</span>\n';
          matches.forEach((m, i) => {
            if (m.groups.length > 0) {
              groupHtml += '<span style="color:#a6e22e">Match ' + (i + 1) + ':</span> ';
              m.groups.forEach((g, gi) => {
                groupHtml += '<span style="color:#e6db74">$' + (gi + 1) + '="' + escapeHtml(g || '') + '"</span> ';
              });
              groupHtml += '\n';
            }
          });
          outputEl.innerHTML += groupHtml;
        }
      } catch (err) {
        outputEl.innerHTML = '<span style="color:var(--error)">Error: ' + escapeHtml(err.message) + '</span>';
      }
    }

    testBtn.addEventListener('click', runTest);

    // Live test on input change
    let debounceTimer;
    function debouncedTest() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runTest, 300);
    }
    regexInput.addEventListener('input', debouncedTest);
    flagsInput.addEventListener('input', debouncedTest);
    inputEl.addEventListener('input', debouncedTest);

    // Override customRender so common.js doesn't break
    this.customRender = (result, el) => {
      el.innerHTML = result;
    };
  },
};
