import { afterEach, describe, expect, it, vi } from 'vitest';
import { RollupView } from '../src/view';
import { rollup } from '../src/table';

const notes = [{ path: 'Notes/meet-1.md', markdown: '| Item | Owner |\n|---|---|\n| Write spec | Ann |\n| Review budget | Ben |\n' }];

function makeView() {
	const el = document.createElement('div');
	document.body.appendChild(el);
	const plugin = { views: new Set(), settings: { debounceMs: 300 } };
	const view = new RollupView({} as never, el, plugin as never);
	return { view, el, draw: (find: string) => (view as never as { draw: (r: unknown, o: unknown) => void }).draw(rollup(notes, { find }), { ...view.options(), find }) };
}

afterEach(() => {
	document.body.empty();
	vi.useRealTimers();
});

describe('find box in the view', () => {
	it('tells that no row holds the find text, not that the notes have no rows', () => {
		const { el, draw } = makeView();
		draw('zzz');
		const text = el.querySelector('.table-rollup-empty')?.textContent ?? '';
		expect(text).not.toContain('No note in this base has');
		expect(text).toContain('zzz');
		expect(el.querySelector('.table-rollup-find-input')).not.toBeNull();
	});

	it('keeps the text that the user types when a live update draws the view again', () => {
		const { el, draw } = makeView();
		draw('');
		const input = el.querySelector<HTMLInputElement>('.table-rollup-find-input')!;
		input.focus();
		input.value = 'bud';
		draw('');
		const next = el.querySelector<HTMLInputElement>('.table-rollup-find-input')!;
		expect(next).not.toBe(input);
		expect(next.value).toBe('bud');
		expect(document.activeElement).toBe(next);
	});

	it('does not write the find text after the view unloads', () => {
		vi.useFakeTimers();
		const { view, el, draw } = makeView();
		view.load();
		draw('');
		const set = vi.spyOn(view.config, 'set');
		const input = el.querySelector<HTMLInputElement>('.table-rollup-find-input')!;
		input.value = 'bud';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		view.unload();
		vi.advanceTimersByTime(500);
		expect(set).not.toHaveBeenCalled();
	});
});
