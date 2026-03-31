const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseField(field, min, max) {
  const values = new Set();
  for (const part of field.split(',')) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    let range = stepMatch ? stepMatch[1] : part;
    const step = stepMatch ? parseInt(stepMatch[2]) : 1;

    if (range === '*') {
      for (let i = min; i <= max; i += step) values.add(i);
    } else if (range.includes('-')) {
      const [a, b] = range.split('-').map(Number);
      for (let i = a; i <= b; i += step) values.add(i);
    } else {
      values.add(parseInt(range));
    }
  }
  return [...values].sort((a, b) => a - b);
}

function describeField(field, min, max, names) {
  if (field === '*') return 'every';
  if (field.startsWith('*/')) return 'every ' + field.slice(2);
  const parts = field.split(',').map(p => {
    if (p.includes('-')) {
      const [a, b] = p.split('-');
      const aName = names ? names[+a] : a;
      const bName = names ? names[+b] : b;
      return aName + '-' + bName;
    }
    return names ? names[+p] : p;
  });
  return parts.join(', ');
}

function describeCron(parts) {
  const [min, hour, dom, month, dow] = parts;
  const lines = [];

  // Minute
  if (min === '*') lines.push('Every minute');
  else if (min.startsWith('*/')) lines.push('Every ' + min.slice(2) + ' minutes');
  else lines.push('At minute ' + min);

  // Hour
  if (hour === '*') lines.push('of every hour');
  else if (hour.startsWith('*/')) lines.push('every ' + hour.slice(2) + ' hours');
  else lines.push('past hour ' + hour);

  // Day of month
  if (dom !== '*') lines.push('on day ' + describeField(dom, 1, 31, null) + ' of the month');

  // Month
  if (month !== '*') lines.push('in ' + describeField(month, 1, 12, MONTHS));

  // Day of week
  if (dow !== '*') lines.push('on ' + describeField(dow, 0, 6, DAYS));

  return lines.join(' ');
}

function getNextRuns(parts, count) {
  const [minF, hourF, domF, monthF, dowF] = parts.map((f, i) => {
    const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
    return parseField(f, ranges[i][0], ranges[i][1]);
  });

  const results = [];
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

  let safety = 0;
  while (results.length < count && safety < 525600) {
    safety++;
    const mo = d.getMonth() + 1;
    const dm = d.getDate();
    const dw = d.getDay();
    const hr = d.getHours();
    const mn = d.getMinutes();

    if (monthF.includes(mo) && domF.includes(dm) && dowF.includes(dw) && hourF.includes(hr) && minF.includes(mn)) {
      results.push(new Date(d));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return results;
}

export default {
  customRender: true,
  actions: [
    {
      label: 'Parse',
      fn: (input) => {
        const expr = input.trim();
        // Handle predefined expressions
        const presets = {
          '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *',
          '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0',
          '@daily': '0 0 * * *', '@midnight': '0 0 * * *',
          '@hourly': '0 * * * *',
        };
        const resolved = presets[expr.toLowerCase()] || expr;
        const parts = resolved.split(/\s+/);
        if (parts.length !== 5) throw new Error('Invalid cron expression. Expected 5 fields: minute hour day month weekday');

        // Validate each field
        parts.forEach((p, i) => {
          const valid = /^(\*|\d+(-\d+)?(,\d+(-\d+)?)*)(\/(\ ?\d+))?$/.test(p) || p === '*';
          if (!valid && !/^\*\/\d+$/.test(p)) throw new Error('Invalid field ' + (i + 1) + ': ' + p);
        });

        const description = describeCron(parts);
        const nextRuns = getNextRuns(parts, 5);
        return { expression: resolved, description, nextRuns };
      },
    },
  ],
  init({ inputEl, outputEl }) {
    inputEl.placeholder = '*/5 * * * *\n\nPresets: @yearly @monthly @weekly @daily @hourly';

    this.customRender = (result, el) => {
      let html = '';
      html += '<span style="color:var(--text-muted)">Expression</span>\n';
      html += '<span style="color:var(--accent);font-size:15px;">' + result.expression + '</span>\n\n';

      html += '<span style="color:var(--text-muted)">Description</span>\n';
      html += '<span style="color:var(--text);font-size:14px;">' + result.description + '</span>\n\n';

      html += '<span style="color:var(--text-muted)">Next 5 runs</span>\n';
      result.nextRuns.forEach((d, i) => {
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
        const timeStr = pad(d.getHours()) + ':' + pad(d.getMinutes());
        const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
        html += '<span style="color:var(--accent)">' + (i+1) + '.</span> ' + dateStr + ' ' + timeStr + ' <span style="color:var(--text-dim)">(' + dayName + ')</span>\n';
      });

      // Cron field reference
      html += '\n<span style="color:var(--text-dim)">┌──────── minute (0-59)\n';
      html += '│ ┌────── hour (0-23)\n';
      html += '│ │ ┌──── day of month (1-31)\n';
      html += '│ │ │ ┌── month (1-12)\n';
      html += '│ │ │ │ ┌ day of week (0-6, Sun=0)\n';
      html += '* * * * *</span>';

      el.innerHTML = html;
    };
  },
};
