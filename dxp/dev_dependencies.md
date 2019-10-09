# Developer Dependencies

> Adding `devDependencies` or `peerDependencies` to your modules inside liferay-portal is not allowed.
>
> This is enforced via SF, which should throw an `Entry devDependencies is not allowed` error if they are found inside a `package.json`

## Rationale

As much as we believe in `the right tool for the job`, the build process for Liferay DXP (`liferay-portal`) is more complicated than the usual frontend project. Hundreds of different modules co-exist in the same repo and are built together at the same time.

Traditional frontend projects live in isolation and their developers are free to choose the tools they want. This usually results in "a minimal dependencies footprint", in the sense that to use the project you would only need to install the tools the project needs.

Liferay DXP is built as a whole from scratch (`ant all`). After that, incremental builds are possible. Currently, we are using [yarn](https://yarnpkg.com/) with a [workspaces setup](https://yarnpkg.com/en/docs/workspaces) to determine the set of dependencies and relations needed globally<sup>[1](#related-resources)</sup>.

Some of the reasons to "veto" arbitrary developer dependencies are:

-   Keep a centralized control over the build process and what tools get brought in
-   Maintain performance of the build process through a minimal dependency footprint
-   Ensure a secure build process. Not all packages are properly vetted or updated when security vulnerabilities are found. When this happens, we need ways to easily react and adapt.
-   Enforce consistency and reliability. Building modules in a cross-platform fashion is often complicated. Making sure that the build works well across different node versions and operating systems (Linux, Windows, macOS...) is complicated and requires a lot of resources. By controlling the dependencies needed for this, we can make sure builds are consistent and reliable.

## How to get a new dependency approved?

The best way to get a developer dependency approved for Liferay DXP is to prove its worth to your fellow frontends. To that end, please:

-   Head over to https://github.com/liferay/liferay-npm-tools and [create a new issue](https://github.com/liferay/liferay-npm-tools/issues/new/choose) of type "devDependency".
-   Present your case, explaining why this new or updated dependency is useful to you and probably to others
-   Work with the team to present a proposal or find suitable alternatives

## Related resources

1. [Liferay DXP build process](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts)
