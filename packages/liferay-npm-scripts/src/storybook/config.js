/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {addDecorator, configure} from '@storybook/react';

import {withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

function loadStories() {
	require(process.env.STORYBOOK_CWD + '/stories');

	addDecorator(withA11y);
	addDecorator(withKnobs);
}

configure(loadStories, module);
