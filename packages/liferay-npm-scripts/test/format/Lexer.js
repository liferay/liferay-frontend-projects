/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Lexer = require('../../src/format/Lexer');

describe('Lexer()', () => {
	it('requires the constructor callback to return a function', () => {
		const lexer = new Lexer(() => null);

		expect(() => lexer.lex('').next()).toThrow(
			'Expected `new Lexer()` callback to return a function'
		);
	});

	describe('allOf()', () => {
		let lexer;

		beforeEach(() => {
			lexer = new Lexer(api => {
				const {allOf, consume, match, token} = api;

				return () => {
					const text = consume(
						allOf(match('foo'), match('bar'), match('baz'))
					);

					return token('ALL', text);
				};
			});
		});

		it('matches a series of matchers irrespective of order', () => {
			expect([...lexer.lex('foobarbaz')]).toEqual([
				{
					contents: 'foobarbaz',
					index: 0,
					name: 'ALL'
				}
			]);

			expect([...lexer.lex('bazbarfoo')]).toEqual([
				{
					contents: 'bazbarfoo',
					index: 0,
					name: 'ALL'
				}
			]);
		});

		it('fails if any matcher fails to match', () => {
			const iterator = lexer.lex('foofoobar');

			expect(() => iterator.next()).toThrow(
				'Failed to match allOf:("foo", "bar", "baz") at: "foofoobar"'
			);
		});
	});

	describe('atEnd()', () => {
		it('returns a boolean', () => {
			const atEndValues = [];

			const lexer = new Lexer(api => {
				const {atEnd, consume, match, token} = api;

				return () => {
					atEndValues.push(atEnd());

					const text = consume(match('stuff'));

					atEndValues.push(atEnd());

					return token('TOKEN', text);
				};
			});

			const iterator = lexer.lex('stuff');

			expect(atEndValues).toEqual([]);

			iterator.next();

			expect(atEndValues).toEqual([false, true]);
		});
	});

	describe('match()', () => {
		let lexer;

		describe('lexing strings', () => {
			beforeEach(() => {
				lexer = new Lexer(api => {
					const {consume, match, token} = api;

					return () => {
						const text = consume(match('thing'));

						return token('THING', text);
					};
				});
			});

			it('lexes strings', () => {
				expect([...lexer.lex('thing')]).toEqual([
					{
						contents: 'thing',
						index: 0,
						name: 'THING'
					}
				]);
			});

			it('returns an iterator', () => {
				const iterator = lexer.lex('thing');

				expect(iterator.next().value).toEqual({
					contents: 'thing',
					index: 0,
					name: 'THING'
				});

				expect(iterator.next().done).toBe(true);
			});

			it('throws if it cannot match', () => {
				const iterator = lexer.lex('bad input');

				expect(() => iterator.next()).toThrow(
					/Failed to match "thing" at: "bad input"/
				);
			});
		});

		describe('lexing regular expressions', () => {
			beforeEach(() => {
				lexer = new Lexer(api => {
					const {consume, match, token} = api;

					return () => {
						const text = consume(match(/foo\d+/));

						return token('THING', text);
					};
				});
			});

			it('lexes patterns', () => {
				expect([...lexer.lex('foo10')]).toEqual([
					{
						contents: 'foo10',
						index: 0,
						name: 'THING'
					}
				]);
			});

			it('treats patterns as anchored', () => {
				const iterator = lexer.lex('...foo10');

				expect(() => iterator.next()).toThrow(
					'Failed to match /foo\\d+/ at: "...foo10"'
				);
			});
		});
	});

	describe('maybe()', () => {
		it('produces an optional match', () => {
			const lexer = new Lexer(api => {
				const {consume, match, maybe, sequence, token} = api;

				return () => {
					const text = consume(
						sequence(
							match('foo'),
							maybe(match('bar')),
							match('baz')
						)
					);

					return token('MAYBE', text);
				};
			});

			expect([...lexer.lex('foobaz')]).toEqual([
				{
					contents: 'foobaz',
					index: 0,
					name: 'MAYBE'
				}
			]);

			expect([...lexer.lex('foobarbaz')]).toEqual([
				{
					contents: 'foobarbaz',
					index: 0,
					name: 'MAYBE'
				}
			]);
		});
	});

	describe('onMatch()', () => {
		it('is called when a token matches', () => {
			const onMatch = jest.fn();

			let meta;

			const lexer = new Lexer(api => {
				const {consume, match, meta: passedMeta, token} = api;

				meta = passedMeta;

				return () => {
					const text = consume(match('foo').onMatch(onMatch));

					return token('...', text);
				};
			});

			expect(onMatch).not.toHaveBeenCalled();

			lexer.lex('foo').next();

			expect(onMatch.mock.calls.length).toBe(1);
			expect(onMatch.mock.calls[0][0][0]).toBe('foo');
			expect(onMatch.mock.calls[0][1]).toBe(meta);
		});

		it('may produce side effects that can be rolled back', () => {
			const snapshots = [];

			const lexer = new Lexer(api => {
				const {consume, match, meta, oneOf, sequence, token} = api;

				const record = match => {
					snapshots.push([`match: ${match[0]}`, [...meta.entries()]]);
				};

				return () => {
					// A complex enough example to demonstrate the
					// "undo-tree" in action. We pursue a branch that
					// will fail and get rolled back before we pursue
					// another that succeeds.
					const text = consume(
						sequence(
							match('a').onMatch((match, meta) => {
								meta.set('a', true);
								record(match);
							}),
							match('b').onMatch((match, meta) => {
								meta.set('b', true);
								record(match);
							}),
							oneOf(
								sequence(
									match('c').onMatch((match, meta) => {
										// Doing something destructive.
										meta.delete('a');
										record(match);
									}),
									match('d').onMatch((match, meta) => {
										meta.set('d', true);
										record(match);
									}),
									match('e').onMatch((match, meta) => {
										meta.set('e', true);
										record(match);
									})
								),
								sequence(
									match('f').onMatch((match, meta) => {
										meta.set('f', true);
										record(match);
									}),
									match('g').onMatch((match, meta) => {
										meta.set('g', true);
										record(match);
									}),
									match('h').onMatch((match, meta) => {
										meta.set('h', true);
										record(match);
									})
								),
								sequence(
									match('c').onMatch((match, meta) => {
										meta.set('c:2', true);
										record(match);
									}),
									match('i').onMatch((match, meta) => {
										meta.set('i', true);
										record(match);
									})
								),
								sequence(
									match('c').onMatch((match, meta) => {
										meta.set('c:3', true);
										record(match);
									}),
									match('j').onMatch((match, meta) => {
										meta.set('j', true);
										record(match);
									})
								)
							),
							match('k').onMatch((match, meta) => {
								meta.set('k', true);
								record(match);
							})
						)
					);

					return token('...', text);
				};
			});

			expect([...lexer.lex('abcjk')]).toEqual([
				{
					contents: 'abcjk',
					index: 0,
					name: '...'
				}
			]);

			expect(snapshots).toEqual([
				['match: a', [['a', true]]],
				['match: b', [['a', true], ['b', true]]],
				['match: c', [['b', true]]],
				['match: c', [['a', true], ['b', true], ['c:2', true]]],
				['match: c', [['a', true], ['b', true], ['c:3', true]]],
				[
					'match: j',
					[['a', true], ['b', true], ['c:3', true], ['j', true]]
				],
				[
					'match: k',
					[
						['a', true],
						['b', true],
						['c:3', true],
						['j', true],
						['k', true]
					]
				]
			]);
		});
	});

	describe('oneOf()', () => {
		it('matches using the first matching matcher in a collection', () => {
			const lexer = new Lexer(api => {
				const {consume, match, oneOf, token} = api;

				return () => {
					const text = consume(
						oneOf(match('foo'), match('bar'), match('baz'))
					);

					return token('ONE_OF', text);
				};
			});

			expect([...lexer.lex('bar')]).toEqual([
				{
					contents: 'bar',
					index: 0,
					name: 'ONE_OF'
				}
			]);
		});
	});

	describe('repeat()', () => {
		it('matches a matcher one or more times', () => {
			const lexer = new Lexer(api => {
				const {consume, match, repeat, token} = api;

				return () => {
					const text = consume(repeat(match('foo')));

					return token('REPEAT', text);
				};
			});

			expect([...lexer.lex('foo')]).toEqual([
				{
					contents: 'foo',
					index: 0,
					name: 'REPEAT'
				}
			]);

			expect([...lexer.lex('foofoofoo')]).toEqual([
				{
					contents: 'foofoofoo',
					index: 0,
					name: 'REPEAT'
				}
			]);
		});
	});

	describe('sequence()', () => {
		it('matches a series of matchers', () => {
			const lexer = new Lexer(api => {
				const {consume, match, sequence, token} = api;

				return () => {
					const text = consume(
						sequence(match('foo'), match('bar'), match('baz'))
					);

					return token('SEQUENCE', text);
				};
			});

			expect([...lexer.lex('foobarbaz')]).toEqual([
				{
					contents: 'foobarbaz',
					index: 0,
					name: 'SEQUENCE'
				}
			]);
		});
	});
});
