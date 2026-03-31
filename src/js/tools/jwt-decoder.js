function decodeBase64Url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function colorize(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let style = 'color:#ae81ff';
      if (/^"/.test(match)) {
        style = /:$/.test(match) ? 'color:#a6e22e' : 'color:#e6db74';
      } else if (/true|false/.test(match)) {
        style = 'color:#66d9ef';
      } else if (/null/.test(match)) {
        style = 'color:#f92672';
      }
      return '<span style="' + style + '">' + match + '</span>';
    }
  );
}

export default {
  customRender: true,
  actions: [
    {
      label: 'Decode',
      fn: (input) => {
        const token = input.trim();
        const parts = token.split('.');
        if (parts.length < 2 || parts.length > 3) {
          throw new Error('Invalid JWT format (expected 2 or 3 parts separated by dots)');
        }
        const header = JSON.parse(decodeBase64Url(parts[0]));
        const payload = JSON.parse(decodeBase64Url(parts[1]));

        // Check common timestamp fields
        const timeFields = ['exp', 'iat', 'nbf'];
        const payloadAnnotated = { ...payload };
        const annotations = {};
        timeFields.forEach((field) => {
          if (typeof payload[field] === 'number') {
            annotations[field] = new Date(payload[field] * 1000).toUTCString();
          }
        });

        return { header, payload, annotations, hasSig: parts.length === 3 };
      },
    },
  ],
  init({ outputEl }) {
    this.customRender = (result, el) => {
      let html = '<span style="color:var(--text-muted)">── Header ──</span>\n';
      html += colorize(formatJson(result.header));
      html += '\n\n<span style="color:var(--text-muted)">── Payload ──</span>\n';
      html += colorize(formatJson(result.payload));

      if (Object.keys(result.annotations).length > 0) {
        html += '\n\n<span style="color:var(--text-muted)">── Timestamps ──</span>\n';
        for (const [key, val] of Object.entries(result.annotations)) {
          html += '<span style="color:#a6e22e">' + key + '</span>: ' + val + '\n';
        }
      }

      if (result.hasSig) {
        html += '\n<span style="color:var(--text-muted)">── Signature ──</span>\n';
        html += '<span style="color:#f92672">⚠ Signature present but not verified (client-side only)</span>';
      }

      el.innerHTML = html;
    };
  },
};
