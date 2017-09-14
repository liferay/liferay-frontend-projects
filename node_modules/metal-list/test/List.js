'use strict';

import { async } from 'metal';
import dom from 'metal-dom';
import List from '../src/List';

var list;

describe('List', function() {
	afterEach(function() {
		if (list) {
			list.dispose();
		}
	});

	it('should render with empty items by default', function() {
		list = new List();
		assert.strictEqual(0, list.element.querySelectorAll('li').length);
	});

	it('should only accept arrays as the value of the "items" state key', function() {
		list = new List({
			items: 2
		});
		assert.deepEqual([], list.items);

		list.items = 'My items';
		assert.deepEqual([], list.items);

		list.items = [{}];
		assert.deepEqual([{}], list.items);
	});

	it('should render the image of given items', function() {
		list = new List({
			items: [{
				avatar: {
					content: '<img src="myImageSrc">',
					class: 'myImageClass'
				}
			}]
		});

		var imgNode = list.element.querySelector('li img');
		assert.ok(imgNode);
		assert.strictEqual('/myImageSrc', imgNode.src.substr(imgNode.src.length - 11));
		assert.ok(dom.hasClass(imgNode.parentNode, 'myImageClass'));
	});

	it('should not render image tag if image was not specified', function() {
		list = new List({
			items: [{}]
		});

		var imgNode = list.element.querySelector('li img');
		assert.ok(!imgNode);
	});

	it('should render the text primary of given items', function() {
		list = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: '<a href="#">Item 2</a>'
			}]
		});

		var contents = list.element.querySelectorAll('li .list-text-primary');
		assert.strictEqual('Item 1', contents[0].textContent);
		assert.strictEqual('Item 2', contents[1].textContent);
		assert.strictEqual('A', contents[1].childNodes[0].tagName);
	});

	it('should render the text secondary of given items', function() {
		list = new List({
			items: [{
				textSecondary: 'Help 1'
			}, {
				textSecondary: '<span>Help 2</span>'
			}]
		});

		var helpNodes = list.element.querySelectorAll('li .list-text-secondary');
		assert.strictEqual('Help 1', helpNodes[0].textContent);
		assert.strictEqual('Help 2', helpNodes[1].textContent);
		assert.strictEqual('SPAN', helpNodes[1].childNodes[0].tagName);
	});

	it('should render the icons of given items', function() {
		list = new List({
			items: [{
				icons: ['icon1']
			}, {
				icons: ['icon2', 'icon3']
			}]
		});

		var iconNodes = list.element.querySelectorAll('li');
		assert.ok(iconNodes[0].querySelector('.icon1'));
		assert.ok(iconNodes[1].querySelector('.icon2'));
		assert.ok(iconNodes[1].querySelector('.icon3'));
	});

	it('should render new items when the state is updated', function(done) {
		list = new List({
			id: 'list',
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}]
		});

		list.items = [{
			textPrimary: 'New Item 1'
		}, {
			textPrimary: 'New Item 2'
		}];
		list.once('stateChanged', function() {
			async.nextTick(function() {
				var contents = list.element.querySelectorAll('li .list-text-primary');
				assert.strictEqual('New Item 1', contents[0].textContent);
				assert.strictEqual('New Item 2', contents[1].textContent);
				done();
			});
		});
	});

	it('should render the specified icons html', function() {
		list = new List({
			items: [
				{
					iconsHtml: [
						'<span class="icon1"></span>',
						'<span class="icon2"></span>'
					]
				}
			]
		});
		var icons = list.element.querySelectorAll('li span');
		assert.strictEqual(2, icons.length);
		assert.ok(dom.hasClass(icons[0], 'icon1'));
		assert.ok(dom.hasClass(icons[1], 'icon2'));
	});

	it('should fire an "itemSelected" event when item is selected', function() {
		list = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}, {
				textPrimary: 'Item 3'
			}]
		});

		var elements = list.element.querySelectorAll('li');

		list.on('itemSelected', function(item) {
			var itemIndex = item.getAttribute('data-index');

			assert.strictEqual(1, parseInt(itemIndex, 10));
		});

		dom.triggerEvent(elements[1].childNodes[0], 'click');
	});

	it('should create an ID attribute in order to other componet could use it', function() {
		list = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}]
		});

		assert.ok(list.element.querySelector('ul').hasAttribute('id'));
	});

	it('should create an ID to each item in order to other componet could use it', function() {
		list = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}]
		});

		var elements = list.element.querySelectorAll('li');

		assert.ok(elements[0].hasAttribute('id'));
		assert.ok(elements[1].hasAttribute('id'));
	});

	it('should not create the same ID to its items', function() {
		list = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}]
		});

		var elements = list.element.querySelectorAll('li');

		assert.notEqual(elements[0].getAttribute('id'), elements[1].getAttribute('id'));
	});

	it('should not create the same ID for two instances', function() {
		list = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}]
		});

		var list2 = new List({
			items: [{
				textPrimary: 'Item 1'
			}, {
				textPrimary: 'Item 2'
			}]
		});

		assert.notEqual(
			list.element.querySelector('ul').getAttribute('id'),
			list2.element.querySelector('ul').getAttribute('id')
		);
	});
});
