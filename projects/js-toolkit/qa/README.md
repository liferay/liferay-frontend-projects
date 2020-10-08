# qa

This folder contains predefined configurations to automatically generate project instances that can be used to do QA testing in the project.

## Auto-generate samples

### Prerequisistes

-   Create a file called .generator-liferay-js.json in your \$HOME directory with these contents:

    ```
    {
        "sdkVersion": "directory/of/your/local/liferay-js-toolkit",
        "answers": {
                "facet-deploy": {
                        "liferayPresent": true,
                        "liferayDir": "directory/of/your/local/liferay/bundle"
                }
        }
    }

    ```

### generate-samples.js script

You can run the script `generate-samples.js` to generate all existing predefined project instances.
