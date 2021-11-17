# Configuration

You can define the schema for the configuration of your portlet so that its
actual value is passed to your
[portlet's entry point](../reference/js-portlet-entry-point.md)
as a parameter named `configuration`.

The configuration can have different scopes:

-   **System**: appears in the the `System Settings` panel of Liferay and is
    passed to your portlet inside the `system` field of the `configuration`
    parameter. It's shared among all the portlet instances.

-   **Portlet instance**: appears in the `Configuration` dialog of each portlet
    and is passed inside the `portletInstance` field of the `configuration`
    parameter. Each portlet instance has its own copy.

All you need to do to enable configuration is creating a
`features/configuration.json` file in your project with the description of your
configuration.

The format of the file is described in
[configuration.json file reference](../reference/configuration-json.md).
