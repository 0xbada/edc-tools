export default {
  actions: [
    {
      label: 'Encode',
      fn: (input) => btoa(unescape(encodeURIComponent(input))),
    },
    {
      label: 'Decode',
      fn: (input) => decodeURIComponent(escape(atob(input))),
    },
  ],
};
