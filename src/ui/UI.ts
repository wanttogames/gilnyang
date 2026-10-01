export const $ = (id: string) => document.getElementById(id)!;
export function panel(html: string) { $('panel').innerHTML = html; }
export function on(id: string, fn: () => void) { document.getElementById(id)?.addEventListener('click', fn); }
export function toast(message: string) { $('toast').textContent = message; $('toast').classList.add('show'); window.setTimeout(() => $('toast').classList.remove('show'), 2500); }
export const icon = (id: string) => `<span class="icon icon-${id}" aria-hidden="true"></span>`;
export function modal(html: string) { $('modal').innerHTML = `<div class="scrim"><section class="sheet">${html}</section></div>`; }
export function closeModal() { $('modal').innerHTML = ''; }
export function food(id: string, size = '') { return `<span class="food food-${id} ${size}" aria-hidden="true"><i></i></span>`; }
