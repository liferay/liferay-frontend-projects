'use strict';

import dom from 'metal-dom';
import ReadingProgressTracker from '../src/ReadingProgressTracker';

describe('ReadingProgressTracker', function() {
	var readingProgress;

	before(function() {
		dom.enterDocument('<style id="style">body{margin:0;padding:0;}');
		dom.enterDocument('<div id="content">' +
			'<div id="content1" style="height:5000px;">Link1</div>' +
			'<div id="content2" style="height:5000px;">Link2</div>' +
			'<div id="content3" style="height:5000px;">Link3</div></div>'
		);
		dom.enterDocument('<ul id="links">' +
			'<li><a id="link1" href="#content1">link1</a></li>' +
			'<li><a id="link2" href="#content2">link2</a></li>' +
			'<li><a id="link3" href="#content3">link3</a></li></ul>'
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

	it('should update progress while scrolling', function(done) {
		readingProgress = new ReadingProgressTracker({
			element: '#links'
		});
		dom.once(document, 'scroll', function() {
			assert.strictEqual(0, readingProgress.activeIndex);
			assert.strictEqual(20, readingProgress.progress);

			dom.once(document, 'scroll', function() {
				assert.strictEqual(0, readingProgress.activeIndex);
				assert.strictEqual(60, readingProgress.progress);
				done();
			});
			window.scrollTo(0, 3000);
		});
		window.scrollTo(0, 1000);
	});

	it('should set "data-reading-progress" to the progress percentage', function(done) {
		readingProgress = new ReadingProgressTracker({
			element: '#links'
		});
		var contents = document.querySelectorAll('#links a');

		dom.once(document, 'scroll', function() {
			assert.strictEqual(0, readingProgress.activeIndex);
			assert.strictEqual('20', contents.item(0).getAttribute('data-reading-progress'));
			assert.ok(!contents.item(1).hasAttribute('data-reading-progress'));
			assert.ok(!contents.item(2).hasAttribute('data-reading-progress'));

			dom.once(document, 'scroll', function() {
				assert.strictEqual(1, readingProgress.activeIndex);
				assert.ok(!contents.item(0).hasAttribute('data-reading-progress'));
				assert.strictEqual('60', contents.item(1).getAttribute('data-reading-progress'));
				assert.ok(!contents.item(2).hasAttribute('data-reading-progress'));
				done();
			});
			window.scrollTo(0, 8000);
		});
		window.scrollTo(0, 1000);
	});

	it('should mark as complete/incomplete while scrolling', function(done) {
		readingProgress = new ReadingProgressTracker({
			element: '#links'
		});
		var contents = document.querySelectorAll('#links a');

		dom.once(document, 'scroll', function() {
			assert.ok(!dom.hasClass(contents.item(0), readingProgress.completedClass));
			assert.ok(!dom.hasClass(contents.item(1), readingProgress.completedClass));
			assert.ok(!dom.hasClass(contents.item(2), readingProgress.completedClass));

			dom.once(document, 'scroll', function() {
				assert.ok(dom.hasClass(contents.item(0), readingProgress.completedClass));
				assert.ok(!dom.hasClass(contents.item(1), readingProgress.completedClass));
				assert.ok(!dom.hasClass(contents.item(2), readingProgress.completedClass));

				dom.once(document, 'scroll', function() {
					assert.ok(dom.hasClass(contents.item(0), readingProgress.completedClass));
					assert.ok(dom.hasClass(contents.item(1), readingProgress.completedClass));
					assert.ok(dom.hasClass(contents.item(2), readingProgress.completedClass));

					dom.once(document, 'scroll', function() {
						assert.ok(dom.hasClass(contents.item(0), readingProgress.completedClass));
						assert.ok(dom.hasClass(contents.item(1), readingProgress.completedClass));
						assert.ok(!dom.hasClass(contents.item(2), readingProgress.completedClass));
						done();
					});
					window.scrollTo(0, 12000);
				});
				window.scrollTo(0, 15000);
			});
			window.scrollTo(0, 8000);
		});
		window.scrollTo(0, 1000);
	});

	it('should not set progress on any link if none is active', function(done) {
		dom.enterDocument('<style id="style">body{ margin-top: 100px; }');
		readingProgress = new ReadingProgressTracker({
			element: '#links'
		});
		var links = document.querySelectorAll('#links a');

		dom.once(document, 'scroll', function() {
			assert.strictEqual(-1, readingProgress.activeIndex);
			assert.ok(!links.item(0).hasAttribute('data-reading-progress'));
			assert.ok(!links.item(1).hasAttribute('data-reading-progress'));
			assert.ok(!links.item(2).hasAttribute('data-reading-progress'));
			done();
		});
		window.scrollTo(0, 50);
	});
});
