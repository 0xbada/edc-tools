function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'color: #ae81ff'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'color: #a6e22e'; // key
        } else {
          cls = 'color: #e6db74'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'color: #66d9ef'; // boolean
      } else if (/null/.test(match)) {
        cls = 'color: #f92672'; // null
      }
      return '<span style="' + cls + '">' + match + '</span>';
    }
  );
}

export default {
  customRender: true,
  actions: [
    {
      label: 'Format',
      fn: (input) => {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
      },
    },
    {
      label: 'Minify',
      fn: (input) => {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
      },
    },
    {
      label: 'Validate',
      fn: (input) => {
        JSON.parse(input);
        return '✓ Valid JSON';
      },
    },
  ],
  init({ outputEl }) {
    this.customRender = (result, el) => {
      if (result === '✓ Valid JSON') {
        el.innerHTML = '<span style="color: var(--accent)">' + result + '</span>';
      } else {
        el.innerHTML = syntaxHighlight(result);
      }
    };
  },
};
