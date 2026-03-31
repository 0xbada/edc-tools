const ENTITIES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export default {
  actions: [
    {
      label: 'Encode',
      fn: (input) => input.replace(/[&<>"']/g, (ch) => ENTITIES[ch]),
    },
    {
      label: 'Decode',
      fn: (input) => {
        const el = document.createElement('textarea');
        el.innerHTML = input;
        return el.value;
      },
    },
  ],
};
