export default {
  actions: [
    {
      label: 'Generate 1',
      fn: () => crypto.randomUUID(),
    },
    {
      label: 'Generate 5',
      fn: () =>
        Array.from({ length: 5 }, () => crypto.randomUUID()).join('\n'),
    },
    {
      label: 'Generate 10',
      fn: () =>
        Array.from({ length: 10 }, () => crypto.randomUUID()).join('\n'),
    },
    {
      label: 'Uppercase',
      fn: () => crypto.randomUUID().toUpperCase(),
    },
  ],
};
