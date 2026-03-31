function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function parseColor(input) {
  input = input.trim();
  // HEX
  let m = input.match(/^#?([0-9a-fA-F]{3,8})$/);
  if (m) {
    const rgb = hexToRgb(m[1]);
    if (rgb) return rgb;
  }
  // rgb(r, g, b) or r, g, b
  m = input.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  // hsl(h, s%, l%)
  m = input.match(/^hsl\s*\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%?\s*[,\s]\s*(\d{1,3})%?\s*\)$/i);
  if (m) return hslToRgb(+m[1], +m[2], +m[3]);
  // CSS named colors (subset)
  const named = { red: '#ff0000', green: '#008000', blue: '#0000ff', white: '#ffffff', black: '#000000',
    yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', orange: '#ffa500', purple: '#800080',
    pink: '#ffc0cb', gray: '#808080', grey: '#808080' };
  if (named[input.toLowerCase()]) return hexToRgb(named[input.toLowerCase()]);
  return null;
}

export default {
  customRender: true,
  actions: [
    {
      label: 'Convert',
      fn: (input) => {
        const rgb = parseColor(input);
        if (!rgb) throw new Error('Invalid color format. Try: #ff5733, rgb(255,87,51), hsl(11,100%,60%)');
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return { rgb, hex, hsl };
      },
    },
    {
      label: 'Random',
      fn: () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        return { rgb: { r, g, b }, hex, hsl };
      },
    },
  ],
  init({ inputEl, outputEl, actionBar }) {
    // Add color picker button
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = '#4ade80';
    picker.title = 'Pick a color';
    picker.style.cssText = 'width:38px;height:38px;padding:2px;border:1px solid var(--border);border-radius:6px;background:var(--bg-elevated);cursor:pointer;vertical-align:middle;';
    picker.addEventListener('input', () => {
      inputEl.value = picker.value;
      // Trigger Convert
      const convertBtn = actionBar.querySelector('.action-btn');
      if (convertBtn) convertBtn.click();
    });
    actionBar.appendChild(picker);

    this.customRender = (result, el) => {
      const { rgb, hex, hsl } = result;
      const cssColor = hex;
      // Determine text color for contrast
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      const textColor = luminance > 0.5 ? '#000' : '#fff';

      el.innerHTML =
        '<div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">' +
          '<div style="width:100px;height:100px;border-radius:8px;border:1px solid var(--border);background:' + cssColor + ';display:flex;align-items:center;justify-content:center;color:' + textColor + ';font-size:12px;flex-shrink:0;">' + hex + '</div>' +
          '<div style="flex:1;min-width:200px;">' +
            '<div style="margin-bottom:12px;"><span style="color:var(--text-muted);">HEX</span><br><span style="color:var(--accent);font-size:15px;">' + hex + '</span></div>' +
            '<div style="margin-bottom:12px;"><span style="color:var(--text-muted);">RGB</span><br><span style="color:var(--accent);font-size:15px;">rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')</span></div>' +
            '<div style="margin-bottom:12px;"><span style="color:var(--text-muted);">HSL</span><br><span style="color:var(--accent);font-size:15px;">hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)</span></div>' +
            '<div><span style="color:var(--text-muted);">CSS</span><br><span style="color:var(--accent);font-size:15px;">rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)</span></div>' +
          '</div>' +
        '</div>';
    };
  },
};
