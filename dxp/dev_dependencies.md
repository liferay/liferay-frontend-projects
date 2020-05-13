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

-   [Create a new issue](https://github.com/liferay/liferay-frontend-guidelines/issues/new/choose) of type "devDependency".
-   Present your case, explaining why this new or updated dependency is useful to you and probably to others
-   Work with the team to present a proposal or find suitable alternatives

## Case study: Lerna

Let's take [Lerna](https://www.npmjs.com/package/lerna), a tool to assist with projects that containing multiple NPM packages, as en example. We'll use a few quick heuristics for evaluating its weight as a dependency.

```
cd $(mktemp -d)
npm init -y
npm install lerna
```

Already, something in the console output suggests that something may be a little off. We created a blank project and added only a single dependency (Lerna) to it, but we see:

```
added 706 packages from 381 contributors and audited 41921 packages in 54.184s
```

Let's count the number of ".js" files:

```
find . -name '*.js' | wc -l
```

Hmmm. 5,215 files just to manage a collection of NPM packages? 🤔

Let's double-check that package count by looking at the number of installed `package.json` files:

```
find node_modules -name package.json | wc -l
731
```

Just to put that into perspective, in liferay-portal, `find . -name package.json | wc -l` tells us that we have 7,008 packages _in total_. Let that sink in for a moment: if we added Lerna to the liferay-portal dependency graph, it would account for about 10% of the entire graph!

Let's look at how much disk space this single package is taking up on our system:

```
du -sh .
72M
```

We can also look at it in another way. Lerna is a dev dependency so we're not going to ship it over the network to a client, but we can still use tools like [BundlePhobia](https://bundlephobia.com/) to get a sense of how large it is. For Lerna, BundlePhobia [informs us](https://bundlephobia.com/result?p=lerna) that we'd be looking at:

-   3.3 mB minified
-   911.5 kB minified + gzipped

What to make of all this? Pretty obviously, Lerna can't possibly be using the logic from 5,215 files to implement its functionality; most of that must be dead (unexercised) code. But just because it isn't exercised doesn't mean it's free: every additional node in that dependency graph is:

-   Code that may contain latent bugs and security problems that could one day manifest as real problems. Even in popular projects, they are very few friendly eyes comprehensively auditing the entire dependency graph to detect potential issues. That means that we're effectively relying on "herd security" to keep us safe — hoping that the lion eats some other animals in the herd before it gets to us, alerting us to the risk in enough time that we can patch the vulnerability — but in the digital world, where lions aren't bounded by physical constraints and attacks can be launched indiscriminately and at scale, this is cold comfort.
-   Code that brings a maintenance burden in terms of `yarn audit` noise (even for code that isn't actually exercised in the project).
-   Code that could present legal problems (again, how confident are we that the entire graph is adequately audited?).
-   Code that, despite being useful, may bring a breaking change in the future that requires a large portion of the dependency graph to be updated.
-   Code that could be redundant with similar code elsewhere in the graph, which means it brings all of the downside costs mentioned here without really justifying itself on the upside in terms of functionality that wouldn't already have been possible using the code already in the graph.

As developers, it's drummed into us that duplicated effort is bad, "reinventing the wheel" is bad, and that by using community-standard implementations we avoid the bugs and mistakes that we'd inevitably encounter if we built our own solution. That's all true. **But** we should bear in mind that dependencies aren't just bundles of pure benefit: they come with their own costs, some of which I've listed above. Ironically, sometimes the dependencies that _seem_ the most useful — upon whose APIs we end up constructing large codebases — are the ones whose breaking changes hurt the most (examples of bad citizens which have churned their APIs in breaking ways for little tangible benefit: Gulp, Yeoman; example of a good citizen: React).

When thinking about adding a new dependency, we should be weighing up both the expected benefit _and_ the (sometimes intangible) costs. Too often, we think only about the former.

This doesn't mean that we should be avoiding _all_ dependencies — clearly we're not going to write our own TypeScript compiler, or our own Babel, ~or our own Webpack~, or our own Jest — but we should be on the lookout for dependencies that clearly don't pull their weight (Lerna might be one of those). When it comes to dependencies, a conservative stance is best.

## Related resources

1. [Liferay DXP build process](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts)
