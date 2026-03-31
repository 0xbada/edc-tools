export default {
  actions: [
    {
      label: 'Encode',
      fn: (input) => encodeURIComponent(input),
    },
    {
      label: 'Decode',
      fn: (input) => decodeURIComponent(input),
    },
    {
      label: 'Encode Full URL',
      fn: (input) => encodeURI(input),
    },
  ],
};
