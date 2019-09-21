# liferay-js-insights

> A simple dependency analysis reporter. It scans ES6 modules for imports and generate a report on used external packages.

## Installation

Either:

-   Install globally: `yarn global add liferay-js-insights`; or:
-   Use the latest without installing: `npx liferay-js-insights` (see below for usage).

## Usage

```
liferay-js-insights [option...]

Options:
  --airtable    [optional: dumps the analysis to a remote airtable installation]
  --apiKey      [optional: airtable API KEY]
  --baseKey     [optional: airtable base]
  --help
  --json        [optional: dumps the analysis as a json file]
```

### Default Report

By default, a table-based report will be displayed on screen unless a different reporter is selected.

`npx liferay-js-insights src/**/*.es.js`

![Default Table Report](/docs/img/report_table.png)

### JSON Report

When the `--json` flag is passed, collected insights will be dumped in a `${name}.json` file. The name of the file can be passed using the `--name` flag. If no flag is passed the name will be that of the cwd last folder.

`npx liferay-js-insights --json src/**/*.es.js`

![Default Table Report](/docs/img/report_json.png)

### Airtable Report

It's possible to persist the collected insights in an [Airtable](https://airtable.com) table by passing the `--airtable` flag.

The setup in advance requires:
- An existing Airtable Base
		- Key for the Base can be provided as `--baseKey` or as an `LFR_DEPS_AIRTABLE_BASE_KEY` environment variable.
- A valid API_KEY for the Airtable Base
		- The API_KEY can be provided as `--apiKey` or as an `LFR_DEPS_AIRTABLE_API_KEY` environment variable.
- An existing Airtable Table with the following structure:
  - `module`:`{string}` - Name of the module with the dependencies. Acts as the primary key of the table.
  - `app`:`{string}` - Parent application of the module.
  - `url`:`{URL}` - GitHub URL of the module.
  - `clay3`:`{[string]}` - List of dependencies with Clay3 packages (@clayui/*).
  - `react`:`{[string]}` - List of dependencies with React packages (frontend-js-react-web).
  - `js`:`{[string]}` - List of dependencies with the common package (frontend-js-web).
  - `metal`:`{[string]}` - List of dependencies with Metl.js packages (metal-*).
  - `clay2`:`{[string]}` - List of dependencies with Clay2 packages (clay-*).
  - `others`:`{[string]}` - List of other dependencies.

- The Table name should be provided as `--name`. If none is passed, it defaults to `master`.

`npx liferay-js-insights --airtable src/**/*.es.js`

![Default Table Report](/docs/img/report_airtable.png)

## Known limitations

- Too many to list them here for now :D