'use strict';

import MultiMap from '../src/MultiMap';

describe('MultiMap', function() {

	it('should add and get single value', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key2', 2);
		assert.strictEqual(1, map.get('key1'));
		assert.strictEqual(2, map.get('key2'));
	});

	it('should set map value', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key1', 1);
		map.set('key1', 2);
		assert.strictEqual(2, map.get('key1'));
	});

	it('should remove map value', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key1', 1);
		map.remove('key1');
		assert.strictEqual(undefined, map.get('key1'));
	});

	it('should get all values for key', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key1', 1);
		map.add('key2', 2);
		map.add('key2', 2);
		assert.deepEqual([1, 1], map.getAll('key1'));
		assert.deepEqual([2, 2], map.getAll('key2'));
	});

	it('should get first added value for key', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key1', 10);
		map.add('key2', 2);
		map.add('key2', 20);
		assert.strictEqual(1, map.get('key1'));
		assert.strictEqual(2, map.get('key2'));
	});

	it('should check if map contains key', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		assert.ok(map.contains('key1'));
		assert.ok(!map.contains('key2'));
	});

	it('should get map size', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key2', 2);
		assert.strictEqual(2, map.size());
	});

	it('should clear map', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		assert.ok(!map.isEmpty());
		map.clear();
		assert.ok(map.isEmpty());
	});

	it('should get map key names', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key2', 2);
		assert.deepEqual(['key1', 'key2'], map.names());
	});

	it('should toString to JSON', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.add('key1', 1);
		assert.strictEqual('{"key1":[1,1]}', map.toString());
	});

	it('should dispose map', function() {
		var map = new MultiMap();
		map.add('key1', 1);
		map.dispose();
		assert.ok(!map.values);
	});

	it('should key name be case insensitive', function() {
		var map = new MultiMap();
		map.add('KEY1', 1);
		map.add('key2', 2);
		assert.strictEqual(1, map.get('key1'));
		assert.strictEqual(2, map.get('KEY2'));
	});

	it('should preserve key case', function() {
		var map = new MultiMap();
		map.add('KEY1', 1);
		assert.deepEqual(['KEY1'], map.names());
	});

	it('should create map from object contents', function() {
		var map = MultiMap.fromObject({
			key1: 1,
			key2: 2
		});
		assert.strictEqual(1, map.get('key1'));
		assert.strictEqual(2, map.get('key2'));
	});

});
