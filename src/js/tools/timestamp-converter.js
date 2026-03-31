export default {
  actions: [
    {
      label: 'To Date',
      fn: (input) => {
        const ts = Number(input.trim());
        if (isNaN(ts)) throw new Error('Invalid timestamp');
        // Support both seconds and milliseconds
        const ms = ts > 9999999999 ? ts : ts * 1000;
        const d = new Date(ms);
        if (isNaN(d.getTime())) throw new Error('Invalid timestamp');
        return [
          'UTC:   ' + d.toUTCString(),
          'ISO:   ' + d.toISOString(),
          'Local: ' + d.toLocaleString(),
        ].join('\n');
      },
    },
    {
      label: 'To Timestamp',
      fn: (input) => {
        const d = new Date(input.trim());
        if (isNaN(d.getTime())) throw new Error('Invalid date string');
        const sec = Math.floor(d.getTime() / 1000);
        const ms = d.getTime();
        return [
          'Seconds:      ' + sec,
          'Milliseconds: ' + ms,
        ].join('\n');
      },
    },
    {
      label: 'Now',
      fn: () => {
        const d = new Date();
        const sec = Math.floor(d.getTime() / 1000);
        return [
          'Seconds:      ' + sec,
          'Milliseconds: ' + d.getTime(),
          'UTC:          ' + d.toUTCString(),
          'ISO:          ' + d.toISOString(),
          'Local:        ' + d.toLocaleString(),
        ].join('\n');
      },
    },
  ],
};
