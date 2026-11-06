import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { rollup } from '../src/table';
import { GROWTH_LIMIT, growth } from './growth';

// The sample vault in docs/sample-notes is also the end-to-end vault. These numbers are the same ones the
// end-to-end test checks in the real app.
const dir = join(__dirname, '..', 'docs', 'sample-notes', 'Meetings');
const notes = readdirSync(dir)
	.sort()
	.map((f) => ({ path: `Table Rollup/Meetings/${f}`, markdown: readFileSync(join(dir, f), 'utf8') }));

describe('sample vault (20 meeting notes)', () => {
	it('merges 64 action item rows with matched headers', () => {
		const r = rollup(notes, { heading: 'Action items', summary: 'sum' });
		expect(notes).toHaveLength(20);
		expect(r.rows).toHaveLength(64);
		expect(r.columns).toEqual(['Task', 'Owner', 'Hours', 'Status', 'Due']);
		expect(r.summary?.[2]).toBe('123.5');
		expect(r.rows.some((x) => x.cells[0] === 'Fix the `a|b` parser')).toBe(true);
		expect(r.rows.some((x) => x.cells[0] === 'Rename A | B')).toBe(true);
	});
	it('open items sum to 82 hours', () => {
		const r = rollup(notes, { heading: 'Action items', summary: 'sum', filter: { column: 'Status', op: 'not-equals', value: 'done' } });
		expect(r.summary?.[2]).toBe('82');
	});
	it('the Decisions tables stay out', () => {
		expect(rollup(notes, { heading: 'Decisions' }).rows).toHaveLength(20);
		expect(rollup(notes, { heading: 'Action items' }).rows.every((x) => x.cells[0] !== 'Keep the weekly sync at 30 minutes')).toBe(true);
	});
	it('20 follow-up tasks from 10 notes', () => {
		const r = rollup(notes, { mode: 'tasks', heading: 'Follow-ups' });
		expect(r.rows).toHaveLength(20);
		expect(r.sources).toBe(10);
	});
	it('2,000 notes merge in linear time (pure part)', () => {
		// The product budget is 300 ms for 500 notes on a quiet machine. A wall-clock limit (300 ms strict, 1,500 ms
		// default) depends on the speed of the runner; under a parallel fx check the median reached 443 ms, and a CI
		// runner can be 9 times slower than the agent Mac. The guard divides the time for 2,000 notes by the time for 200
		// notes, lowest time of each size over 5 rounds, both measured in this test (s1103b ASSERT-B, Procedure AC).
		// 2,000 notes and not 500: an insertion sort of the rows (plant tr-insertion-sort) gave 44 at 500 notes, too
		// close to the limit of 40.
		const many = (n: number) => Array.from({ length: n }, (_, i) => ({ path: `p/${i}.md`, markdown: notes[i % 20]!.markdown }));
		const opts = { heading: 'Action items', summary: 'sum', sort: { column: 'Hours', dir: 'desc' } } as const;
		expect(rollup(many(500), opts).rows).toHaveLength(1600);
		expect(rollup(many(2000), opts).rows).toHaveLength(6400);
		const g = growth((n) => {
			const input = many(n);
			return () => rollup(input, opts);
		}, 2000);
		expect(g.ratio, g.text).toBeLessThan(GROWTH_LIMIT);
	});
});
