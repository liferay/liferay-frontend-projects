/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

var menuButton = document.querySelector('.nav-menu-button');
var nav = document.querySelector('#nav');

menuButton.addEventListener('click', (e) => {
	e.preventDefault();
	nav.classList.toggle('active');
});
