'use strict';

import dom from 'metal-dom';
import ReadingProgress from '../src/ReadingProgress';

describe('ReadingProgress', function() {
	var readingProgress;

	before(function() {
		dom.enterDocument('<style id="style">body{margin:0;padding:0;}');
		dom.enterDocument('<div id="content">' +
			'<div id="content1" style="height:5000px;"><h1>Title 1</h1><p>Content1</p></div>' +
			'<div id="content2" style="height:5000px;"><h1>Title 2</h1><p>Content2</p></div>' +
			'<div id="content3" style="height:5000px;"><h1>Title 3</h1><p>Content3</p></div></div>'
		);
	});

	afterEach(function() {
		if (readingProgress) {
			readingProgress.dispose();
		}
	});

	after(function() {
		document.body.innerHTML = '';
	});

	it('should render the items according to the "items" attribute', function() {
		readingProgress = new ReadingProgress({
			items: [
				{
					href: '#content1',
					time: 200,
					title: 'Chosen Title 1'
				},
				{
					href: '#content2',
					time: 100,
					title: 'Chosen Title 2'
				}
			]
		});

		var items = readingProgress.element.querySelectorAll('a');
		assert.strictEqual('#content1', items.item(0).hash);
		assert.strictEqual('Chosen Title 1', items.item(0).querySelector('.reading-title').textContent);
		assert.strictEqual('3 min read', items.item(0).querySelector('.reading-subtitle').textContent);
		assert.strictEqual('#content2', items.item(1).hash);
		assert.strictEqual('Chosen Title 2', items.item(1).querySelector('.reading-title').textContent);
		assert.strictEqual('2 min read', items.item(1).querySelector('.reading-subtitle').textContent);
	});

	it('should generate title from the referenced content when none is given', function() {
		readingProgress = new ReadingProgress({
			items: ['#content1', '#content2', '#content3']
		});

		var titles = readingProgress.element.querySelectorAll('.reading-title');
		assert.strictEqual('Title 1', readingProgress.items[0].title);
		assert.strictEqual('Title 1', titles.item(0).textContent);
		assert.strictEqual('Title 2', readingProgress.items[1].title);
		assert.strictEqual('Title 2', titles.item(1).textContent);
		assert.strictEqual('Title 3', readingProgress.items[2].title);
		assert.strictEqual('Title 3', titles.item(2).textContent);
	});

	it('should generate expected time from the referenced content when none is given', function() {
		document.querySelector('#content1 p').innerHTML = getBigText(1600);
		document.querySelector('#content2 p').innerHTML = getBigText(750);
		document.querySelector('#content3 p').innerHTML = getBigText(3100);

		readingProgress = new ReadingProgress({
			items: ['#content1', '#content2', '#content3']
		});

		var times = readingProgress.element.querySelectorAll('.reading-subtitle');
		assert.strictEqual(64, readingProgress.items[0].time);
		assert.strictEqual('1 min read', times.item(0).textContent);
		assert.strictEqual(30, readingProgress.items[1].time);
		assert.strictEqual('30 sec read', times.item(1).textContent);
		assert.strictEqual(124, readingProgress.items[2].time);
		assert.strictEqual('2 min read', times.item(2).textContent);
	});

	it('should only generate missing item info when href is hash link', function() {
		readingProgress = new ReadingProgress({
			items: ['#content1', 'noHash', '#content3']
		});

		assert.strictEqual('Title 1', readingProgress.items[0].title);
		assert.ok(!readingProgress.items[1].title);
		assert.strictEqual('Title 3', readingProgress.items[2].title);
	});

	it('should not create new ReadingProgressTracker after each render', function(done) {
		readingProgress = new ReadingProgress({
			items: ['#content1', '#content2', '#content3']
		});

		var tracker = readingProgress.getTracker();
		assert.ok(tracker);

		readingProgress.items = ['#content1', '#content2'];
		readingProgress.once('stateSynced', function() {
			assert.strictEqual(tracker, readingProgress.getTracker());
			done();
		});
	});

	it('should update progress bar when the tracker\'s progress attr changes', function() {
		readingProgress = new ReadingProgress({
			items: ['#content1', '#content2', '#content3']
		});
		var tracker = readingProgress.getTracker();

		tracker.activeIndex = 1;
		tracker.progress = 30;

		var circle = readingProgress.element.querySelectorAll('circle').item(1);
		assert.strictEqual('70', circle.getAttribute('stroke-dashoffset'));

		tracker.progress = 40;
		assert.strictEqual('60', circle.getAttribute('stroke-dashoffset'));
	});

	function getBigText(charCount) {
		var text = '';
		for (var i = 0; i < charCount; i++) {
			text += 'c';
		}
		return text;
	}
});
