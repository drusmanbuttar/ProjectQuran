// Small outline symbols shared by navigation and reader actions.
const paths = {
  home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M3 4c3-1 6-.5 9 2 3-2.5 6-3 9-2v15c-3-1-6-.5-9 2-3-2.5-6-3-9-2zM12 6v15"/>',
  study: '<path d="m12 2 3 3 4 1 1 4 2 2-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-2 1-4 4-1z"/><path d="m15 9-2 5-4 1 1-4z"/>',
  find: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  saved: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  moon: '<path d="M20.5 14a8.5 8.5 0 0 1-10-10.5A9 9 0 1 0 20.5 14z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  settings: '<path d="M3 6h6m5 0h7M3 12h11m5 0h2M3 18h3m5 0h10"/><circle cx="11" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  pin: '<path d="M8 3h8l-1 6 3 4v1H6v-1l3-4zM12 14v7"/>',
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10m0-4c7 0 12 0 12-4"/>',
  layers: '<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  time: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  close: '<path d="m5 5 14 14M5 19 19 5"/>'
};
export function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
}
