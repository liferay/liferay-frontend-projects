This page describes the format used to describe settings configuration in `liferay-npm-bundler` projects.

## Base format

```json
{
	"name": "{name of configuration}",
	"fields": {
		"{field id 1}": {
			"type": "{field type}",
			"name": "{field name}",
			"description": "{field description}",
			"default": "{default value}",
			"options": {
				"{option id 1}": "{option name 1}",
				"{option id 2}": "{option name 2}",

				"{option id n}": "{option name n}"
			}
		},
		"{field id 2}" : {
		},

		"{field id n}" : {
		}
	}
}
```

### Where

#### `{name of configuration}`

Can be a string or a localization key describing the human readable name of the configuration. If not given the bundler falls back to the project's name, then description given in `package.json`.

#### `{field id}`

Can be a string or a localization key describing the human readable name of the field.

#### `{field type}`

Can be any of the following types:

- `number`: an integer number
- `float`: a floating point number
- `string`: a string
- `boolean`: true or false
- `password`: same as string but is not displayed to user

#### `{field name}`

Can be a string or a localization key describing the human readable name of the field.

#### `{field description}`

An optional string or localization key describing the human readable hint text of the field. The hint is a short sentence explaining what is the field for.

#### `{default value}`

An optional default value for the field.

#### `options`

This section is optional and allows the definition of a fixed set of values for the field.

#### `{option id}`

A string that defines the value taken by the field when the option is selected.

#### `{option name}`

Can be a string or a localization key describing the human readable name of the option.

## Example

```json
{
  "name": "My project",
  "fields": {
    "a-number": {
      "type": "number",
      "name": "A number",
      "description": "An integer number",
      "default": "42"
    },
    "a-float": {
      "type": "float",
      "name": "A float",
      "description": "A floating point number",
      "default": "1.1"
    },
    "a-string": {
      "type": "string",
      "name": "A string",
      "description": "An arbitrary length string",
      "default": "this is a string"
    },
    "a-boolean": {
      "type": "boolean",
      "name": "A boolean",
      "description": "A true|false value",
      "default": true
    },
    "a-password": {
      "type": "password",
      "name": "A password",
      "description": "A secret string",
      "default": "s3.cr3t"
    },
    "an-option": {
      "type": "string",
      "name": "An option",
      "description": "A restricted values option",
      "required": true,
      "default": "A",
      "options": {
        "A": "Option a",
        "B": "Option b"
      }
    }
  }
}
```
