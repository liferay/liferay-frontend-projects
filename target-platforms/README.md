# liferay-target-platforms

This repository holds Target Platforms for the Liferay CE Portal and DXP
products.

## What is a Target Platform?

A Target Platform is a single `npm` dependency that you may use in your
JavaScript projects to have all needed dependencies and tools to deploy it in a
specific release of Liferay CE Portal or DXP.

The Target Platform dependencies takes care of all configuration details for
you, so that you don't need to bother about dependency numbers or configuring
the parts of the build that can be inferred from the target version of Liferay
CE Portal/DXP.

## Supported Target Platforms

Right now we support the following platforms:

## How to use Target Platforms

Even though you can use Target Platforms alone, they are intended to be
pre-configured by tools like the
[JS Toolkit Generator](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/docs/How-to-use-generator-liferay-js.md)
or
[Liferay Workspace](https://learn.liferay.com/dxp/latest/en/developing-applications/tooling/liferay-workspace/what-is-liferay-workspace.html)
so please refer to those tools' documentation on how to leverage Target
Platforms.
