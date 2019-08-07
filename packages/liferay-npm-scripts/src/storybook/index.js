/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as StorybookReact from '@storybook/react';
import * as StorybookAddonKnobs from '@storybook/addon-knobs';
import * as StorybookAddonActions from '@storybook/addon-actions';

const STORYBOOK_CONSTANTS = {
	SPRITEMAP_PATH:
		'/modules/apps/frontend-theme/frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled/images/clay/icons.svg'
};

export {
	STORYBOOK_CONSTANTS,
	StorybookAddonActions,
	StorybookAddonKnobs,
	StorybookReact
};
