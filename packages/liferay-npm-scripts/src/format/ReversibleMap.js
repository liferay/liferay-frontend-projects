/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CHECKPOINT = Symbol.for('CHECKPOINT');

/**
 * Map subclass that shallowly records all mutations and provides
 * `rollback()`, `commit()` and `checkpoint()` methods for reversing those
 * mutations.
 */
class ReversibleMap extends Map {
	constructor(iterable) {
		super(iterable);

		this.pending = [];
	}

	/**
	 * Creates a snapshot of the internal storage and adds it to the `pending`
	 * array. We always recreate all entries in order to preserve entry
	 * ordering.
	 */
	_snapshot() {
		// If called from constructor, this.pending won't be set yet.
		if (this.pending) {
			const entries = [...this.entries()];

			this.pending.push(() => {
				Map.prototype.clear.call(this);

				entries.forEach(([key, value]) => {
					Map.prototype.set.call(this, key, value);
				});
			});
		}
	}

	clear() {
		this._snapshot();

		super.clear();
	}

	/**
	 * Records a checkpoint that will be the target for the next `rollback()`
	 * operation.
	 */
	checkpoint() {
		this.pending.push(CHECKPOINT);
	}

	/**
	 * Commits and clears all pending changes. After commiting, no rollback is
	 * possible.
	 */
	commit() {
		this.pending = [];
	}

	delete(key) {
		this._snapshot();

		super.delete(key);
	}

	/**
	 * Rolls back to the last checkpoint.
	 */
	rollback() {
		while (this.pending.length) {
			const operation = this.pending.pop();

			if (operation === CHECKPOINT) {
				break;
			} else {
				operation();
			}
		}
	}

	set(key, value) {
		this._snapshot();

		super.set(key, value);
	}
}

module.exports = ReversibleMap;
