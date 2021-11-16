/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

	/* ==========================================================================
     Creates a new Senna app
     ========================================================================== */

	console.log('Senna version:', senna.version);

	var app = new senna.App();

	app.setBasePath('/examples/blog');
	app.addSurfaces('posts');
	app.addRoutes(new senna.Route(/\w+\.html/, senna.HtmlScreen));

	/* ==========================================================================
     Creates loading feedback HTML element
     ========================================================================== */

	var loadingFeedback = document.createElement('div');

	loadingFeedback.innerHTML = 'Loading more posts...';
	loadingFeedback.classList.add('loading');

	/* ==========================================================================
     Locks scroll position during navigation
     ========================================================================== */

	var isLoading = false;
	var scrollSensitivity = 0;

	app.on('startNavigate', (event) => {
		isLoading = true;
		scrollSensitivity = 0;

		if (!event.replaceHistory) {
			app.setUpdateScrollPosition(false);
		}
	});

	app.on('endNavigate', () => {
		isLoading = false;

		app.setUpdateScrollPosition(true);
	});

	/* ==========================================================================
     Infinite scrolling logic
     ========================================================================== */

	document.addEventListener('scroll', () => {
		if (window.pageYOffset < 0) {
			return;
		}

		scrollSensitivity++;

		if (isLoading || scrollSensitivity < 5) {
			return;
		}

		if (window.innerHeight * 0.4 > getScrollDistanceToBottom()) {
			debouncedNextPageLoader();
		}
	});

	var debouncedNextPageLoader = debounce(loadNextPage, 100);

	function loadNextPage() {
		if (!app.pendingNavigate && window.nextPage) {
			document.querySelector('#posts').appendChild(loadingFeedback);

			// Goes to the next page using senna.App

			app.navigate(window.nextPage);
		}
	}

	function getScrollDistanceToBottom() {
		return (
			document.body.offsetHeight - window.pageYOffset - window.innerHeight
		);
	}

	function debounce(fn, delay) {
		return function debounced() {
			var args = arguments;
			debounced.id = setTimeout(() => {
				fn.apply(null, args);
			}, delay);
		};
	}
});
