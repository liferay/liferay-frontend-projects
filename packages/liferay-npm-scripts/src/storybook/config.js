/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {configure} from '@storybook/react';

function loadStories() {
	require('../stories');
}

configure(loadStories, module);
