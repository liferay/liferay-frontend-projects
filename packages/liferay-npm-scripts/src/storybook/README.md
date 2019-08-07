# Storybook

The storybook configurations currently only support React components.

## Usage

`package.json`

```json
{
	"scripts": {
		"storybook": "liferay-npm-scripts storybook"
	}
}
```

Run

```sh
liferay-npm-scripts storybook
```

## Setup

Create a `test/stories` directory in the root of the module. This is where all your story files will live.

```
sample-web
└── test
    └── stories
```

Create a file `index.es.js` which will be the entry point for the stories.

```
sample-web
└── test
    └── stories
        └── index.es.js
```

Inside `index.es.js`, import `StorybookReact`

```javascript
import {StorybookReact} from 'liferay-npm-scripts/src/storybook';
```

Write your first story. Below is an example:

```javascript
const {storiesOf} = StorybookReact;

storiesOf('Button', module)
    .add('default', () => (
        <Button />
    )
    .add('primary', () => (
        <Button style="primary" />
    )
);
```

Read more about writing stories on [the official Storybook docs](https://storybook.js.org/docs/basics/writing-stories/).

## Addons

The following addons are provided:

-   [A11y](https://github.com/storybookjs/storybook/tree/master/addons/a11y) - Tests for a11y violations.
-   [Actions](https://github.com/storybookjs/storybook/tree/master/addons/actions) - Used to display data received by event handlers.
-   [Knobs](https://github.com/storybookjs/storybook/tree/master/addons/knobs) - Allow you to edit React props dynamically using the Storybook UI.
-   [Viewport](https://github.com/storybookjs/storybook/tree/master/addons/viewport) - Allows your stories to be displayed in different sizes and layouts. This helps build responsive components inside of Storybook.

A11y and viewport addons are automatically included. To use the actions and knobs addon, you can import `StorybookAddonActions` and `StorybookAddonKnobs`.

```javascript
import {
	StorybookAddonActions,
	StorybookAddonKnobs
} from 'liferay-npm-scripts/src/storybook';

const {action} = StorybookAddonActions;
const {array, boolean, select, text} = StorybookAddonKnobs;
```

Visit the docs linked above on each addon to learn how to use the addons in stories.

## Other

A constant `STORYBOOK_CONSTANTS.SPRITEMAP_PATH` is also exported that provides a path the local portal icons.svg file. It is defined [here](./index.js#L11-L14).

```javascript
import {STORYBOOK_CONSTANTS} from 'liferay-npm-scripts/src/storybook';
```

## Configuration

Create a file `npmscripts.config.js` in the module root (if one doesn't already exist).

Default storybook configuration:

```javascript
module.exports = {
	preset: 'liferay-npm-scripts/src/presets/standard',
	storybook: {
		// A list of Language.properties files to translate
		// Liferay.Language.get() functions.
		languagePaths: ['src/main/resources/content/Language.properties'],

		// The port storybook will run on.
		port: '9000',

		// URL of a running portal instance to proxy `/o` resources.
		portalURL: 'http://0.0.0.0:8080'
	}
};
```

## Full Example

This is a complete example of a possible Storybook file for the `segments-web` module. It includes wrapping all components with a React Context.

```javascript
import React from 'react';
import {
	STORYBOOK_CONSTANTS,
	StorybookAddonActions,
	StorybookReact
} from 'liferay-npm-scripts/src/storybook';

import '../../src/main/resources/META-INF/resources/css/main.scss';

import Conjunction from '../../src/main/resources/META-INF/resources/js/components/criteria_builder/Conjunction.es';
import ThemeContext from '../../src/main/resources/META-INF/resources/js/ThemeContext.es';

const {addDecorator, storiesOf} = StorybookReact;
const {action} = StorybookAddonActions;

addDecorator(storyFn => {
	const context = {
		spritemap: STORYBOOK_CONSTANTS.SPRITEMAP_PATH
	};

	return (
		<ThemeContext.Provider value={context}>
			<div className="segments-root">{storyFn()}</div>
		</ThemeContext.Provider>
	);
});

storiesOf('Components|Conjunction', module).add('default', () => (
	<Conjunction
		conjunctionName="AND"
		editing
		supportedConjunctions={[
			{
				label: Liferay.Language.get('and'),
				name: 'AND'
			},
			{
				label: Liferay.Language.get('or'),
				name: 'OR'
			}
		]}
	/>
));
```
