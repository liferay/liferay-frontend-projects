# React state management

State management is a complicated topic which we can't possibly hope to cover fully in a guidelines document like this, but this page provides three things to get you started:

1. General principles for how to manage state in React.
2. Guidelines on the use of Liferay's global state API, as provided by `@liferay/frontend-js-state-web`.
3. Links to further reading.

## General principles

When you first encounter React it may look like just a rendering library for updating the DOM using JS. As you get to know it better, you'll see it is more than that, and it has a number of novel ideas, including:

1. Components are the fundamental unit of abstraction and composition.
2. Data flows down from the top of the component tree towards the bottom.
3. Shared data should be immutable, and functions should be pure.

In sum, these principals act together to make software systems easier to reason about, safe to modify, and enable reuse. In order to get the most out of these patterns, we have to make sure that state management — one of the most complicated aspects of applications as they grow larger — follows some "best practices":

### Keep component state as close as possible to where it is needed

React provides [a `useState` hook](https://reactjs.org/docs/hooks-state.html) for reading and updating state. You can think of state as a "variable" that is associated with a component, and whenever that variable changes, the component will be updated (re-rendered). If you only need state in one component, store that state locally "inside" the component using `useState`. Storing state inside a component means that it is encapsulated, which makes it easier to reason about how that component will behave. (Contrast this with global state, where in order to understand the behavior of a component that accesses global state, you have to understand all the places in the entire system that may read from or write to that global state.)

### When state needs to be shared among a small subtree of components, hoist it up to the nearest common ancestor

As a simple example, consider two neighboring components that must share a piece of text: one of them shows an input field for changing the text, and the other shows a marked-up version of the text. If we follow the guideline to "keep component state as close as possible to where it is needed" in this scenario, that means moving the state up into the parent component. The parent component "owns" the state and contains the `useState` call. The child components receive the value via [props](https://reactjs.org/docs/components-and-props.html). Note that data always flows down, so in order to update the state in the parent, it must also pass down a callback that the child can use in order to request an update. That might look like this:

```jsx
function ParentComponent() {
	const [name, setName] = useState('');

	return (
		<>
			<ChildComponent
				onValueChange={(newName) => setName(name)}
				value={name}
			/>
			<OtherComponent value={name} />
		</>
	);
}
```

### Simplify the component hierarchy as much as possible

One of the main reasons we define things in terms of components is to make them intellectually manageable and to facilitate reuse. That _often_ means making components small and giving them a single responsibility, but it doesn't _always_ mean that.

In the example above, note that if we don't need to reuse either of the child components in multiple places, then we don't even need to make them separate entities; we can just inline them. Even though the resulting component will not be as small, and maybe we have to work a little to express its "single responsibility" in terms of slightly higher-level language, this change has made the system as a whole more intellectually manageable by colocating all of the parts that are concerned with that particular piece of state. We no longer have to pass state down through the hierarchy, nor manage callbacks just for the purposes of children "phoning home" back up the tree. We've factored away two child components that we would otherwise have had to come up with names for (and naming is one of [two hard things](https://martinfowler.com/bliki/TwoHardThings.html)), and perhaps we've even managed to get rid of a couple of separate files that would otherwise produce friction every time we have to move between them.

### When subtrees that must share state become large, use context

As components start to need to share state it may be tempting to reach for an external state management library. There are dozens of such libraries, but some notable examples include:

-   [Flux](https://facebook.github.io/flux/): The original "unidirectional data flow pattern" created at Facebook.
-   [Redux](https://redux.js.org/): A simple idea (using a reducer function to produce the "next state" from the "previous state" plus an "action") which has grown a large ecosystem of secondary patterns, helpers, and libraries.
-   [Undux](https://undux.org/): A rejection of the complexity and boilerplate of modern Redux, aims to be type-safe and as simple as possible.
-   [Recoil](https://recoiljs.org/): Similar to Undux, seeks to be a "simpler" Redux.
-   [Apollo Client](https://www.apollographql.com/docs/react/) or [Relay](https://relay.dev/): Two examples of libraries that go beyond simple state management and seek to encompass all communication with the server as well, via [GraphQL](https://graphql.org/).

Before reaching for a heavy-weight solution, use some additional tools from the React toolset:

-   [The `useContext` hook](https://reactjs.org/docs/hooks-reference.html#usecontext): Allows you to share values throughout an entire subtree without having to explicitly pass them down via ["prop drilling"](https://kentcdodds.com/blog/prop-drilling); only the components that actually care about that data need to use the `useContext` hook, and every other component can ignore it.
-   [The `useReducer` hook](https://reactjs.org/docs/hooks-reference.html#usereducer): Borrows the "reducer" idea from Redux of producing a "next state" from a "previous state" plus an action. Use this to explicitly encode transitions between states in one place. This is a useful way of consolidating what would otherwise be a bunch of informally related pieces of state into a single value where the relationship between the subparts is made explicit.

Note that these two hooks are flexible, and can be combined in various ways. For example:

-   Application state can be divided into multiple different contexts so that components can access subsets of state and ignore the rest. This more granular access can make the needs and behaviors of individual components easier to understand, and also avoids the situation where updating a single monolithic context would cause the entire app to re-render any time anything changed.
-   Reducers can be used to update the state that is managed by a context. Instead of passing down callbacks via prop drilling, a common pattern is to make a `dispatch` function available via context to anybody who needs to perform an action, and then individual components can use that to cause the shared state to update and then propagate back down through the app.

Ultimately, even if you do conclude that you want to use a heavier-weight state library, remember that it is usually not necessary to put _all_ of your application's data inside it; you can still follow the guideline of "Keep component state as close as possible to where it is needed" and benefit from simpler, easier-to-reason-about code with a lower barrier to entry in many places within your app.

### Only use state for things that must change and cause updates

Just because the `useState` hook and others are so convenient and handy to use doesn't mean that you have to use them for _everything_ that might be considered a "variable". React also provides:

-   [The `useRef` hook](https://reactjs.org/docs/hooks-reference.html#useref): Associates a mutable value with a component. You can write to and read from it freely, but updating it won't trigger a re-render.
-   [The `useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) and [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) hooks: Store values that are expensive to compute (eg. `useMemo`) or which are functions whose identity you want to remain stable over time (eg. `useCallback`).

### Beware of stale closures

At the end of the day, hooks are just function calls and they work with JavaScript values. Notably, functions themselves can be passed around as values in JavaScript, and some common hook patterns make heavy use of this language feature. In addition to the already-mentioned `useMemo` and `useCallback`, hooks such as [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useeffect) and [`useLayoutEffect`](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) both take functions as parameters. Given the prevalent use of functions in JS, it's important to have a good mental model for how closures operate, otherwise you may run into bugs.

The following simple example illustrates the potential pitfall using vanilla JS:

```js
for (var i = 0; i < 10; i++) {
	setTimeout(() => console.log(i));
}
```

Functions "close over" the variables in the scope in which they are defined. That means they continue to "see" the current value of the variable, even if execution has moved on from the scope in which the function was declared. In this example, the `setTimeout` calls mean that our `console.log` statements will all run after a brief delay, after the `for` loop has exited. _All_ ten calls will log the value `10`, because every instance of the function has access to the _same_ `i` variable and faithfully prints out its current value, not as it was at the time the `for` loop body ran, but as it is right now.

The above example won't work in modern JS with the `let` keyword (one of the reasons `let` was added to the language was to give JS a lexically-scoped binding mechanism with friendlier behavior in loop bodies, which means that [every iteration through the loop gets a fresh binding](https://2ality.com/2015/02/es6-scoping.html#let-in-loop-heads) and the code prints `0` through `9` as you would expect), but stale closure problems can easily still arise in the React world. The root cause is the same (closing over a variable in an undesired way), even if the way the problem manifests is different (see [this video for multiple examples](https://www.youtube.com/watch?v=eVRDqtTCd74)). In essence they all boil down to a function closing over a concrete value and then continuing to see that same value for the lifetime of the program:

```js
const [value, setValue] = useState(0);

useEffect(() => {
    const handle = setInterval(() => }
        setValue(value + 1);
    }, 1000);

    return () => clearInterval(handle);
}, []);
```

In this example, the author intends to increment `value` by `1` every second, but the code only increments it once even though the `setInterval` callback continues firing. What's actually happening here is:

1. On first render, `value` is initialized to `0`. `useEffect` runs and calls `setInterval`, with the expectation that `setValue(value + 1)` will run once per second from then on.
2. The `setInterval` callback fires, causing `setValue(value + 1)` to be executed. The closed-over `value` of `0` is used, so this effectively means `setValue(1)`.
3. Due to the state update, we render again. `value` is now `1`. `useEffect` runs again but does nothing (because there was no change to the items in the dependency array).
4. The `setInterval` callback fires again, again using the closed-over `value` of `0`. It does _not_ get the new value of `1`. So, we call `setValue(1)` again, which has no useful effect.

In practice, once you understand the nature of the stale closure problem, fixing it is usually quite easy. [This article](https://dmitripavlutin.com/react-hooks-stale-closures/) goes over some examples and solutions, such as:

-   Providing dependency arrays that cause hooks to be re-evaluated when dependencies change (thus closing over new values).
-   Using [the "functional update form"](https://reactjs.org/docs/hooks-reference.html#functional-updates) of the `useState` hook that gives you access to the current value at the time of making the update (eg. `setValue((previousValue) => previousValue + 1)`).

## Liferay's global state API

As of [LPS-127081](https://github.com/brianchandotcom/liferay-portal/pull/99823) we have a new API for sharing and synchronizing state across apps, globally, in Liferay DXP.

> :warning: The API is not intended to be a store for **all state** in an application. The guideline to "Keep component state as close as possible to where it is needed" still holds true. This API is specifically for the subset of data that needs to be shared across otherwise independent applications within DXP.

The [`@liferay/frontend-js-state-web`](https://github.com/liferay/liferay-portal/tree/d0d7e3ea746da907234e1f838d70d3b8bd458a5e/modules/apps/frontend-js/frontend-js-state-web) API provides a set of functions for reading and writing global state, as well as subscribing to updates, in a type-safe manner. Under the covers, you can think of it as a global key-value store, but your interaction with it is expressed in terms of three higher-level concepts that borrow their terminology from the [Recoil](https://recoiljs.org/) state-management library:

-   **Atom:** An immutable data type that represents a "unit" of shared state. Atoms have a unique string key, a type `T`, and a default value. Even though atoms themselves are immutable, they are each associated with a corresponding "current" value that can be read, updated, and observed.

    Given an atom, you can interact with the current value associated with it in these ways:

    -   Read it with `Liferay.State.read()` or `Liferay.State.readAtom()`.
    -   Update it with `Liferay.State.write()` or `Liferay.State.writeAtom()`.
    -   Subscribe to be notified of changes with `Liferay.State.subscribe()`.
    -   In React components, the `useLiferayState()` hook does all the above.

-   **Selector:** An immutable data type that represents a shared unit of derived state. Selectors are identified by a unique string key. They derive their values via a "pure" function that reads atoms and/or other selectors. Selectors form a dependency graph, which means that when upstream atoms or selectors change, the dependent selectors get automatically and efficiently recomputed.

    Given a selector, you can interact with the current value associated with it in these ways:

    -   Read it with `Liferay.State.read()` or `Liferay.State.readSelector()`.
    -   Subscribe to be notified of changes with `Liferay.State.subscribe()`.
    -   In React components, the `useLiferayState()` hook does all the above.

    Note that, unlike atoms, you cannot `write()` directly to a selector; instead, you update them by changing their upstream atoms, which causes the affected selectors to re-derive their updated values.

-   **`useLiferayState`:** A [hook](https://reactjs.org/docs/hooks-intro.html)-based abstraction over `Liferay.State.read()`, `Liferay.State.write()`, and `Liferay.State.subscribe()` that allows you to conveniently read/update/watch atoms or selectors from within a React component in a way that is similar to React's own `useState()` hook. Given an atom or selector, it returns a tuple containing the current value and a function for updating it. Note, however, that actually trying to update a selector will throw an error because selectors are read-only.

The full API for the `Liferay.State` object can be seen in [its implementation in `frontend-js-state-web`](https://github.com/liferay/liferay-portal/blob/d0d7e3ea746da907234e1f838d70d3b8bd458a5e/modules/apps/frontend-js/frontend-js-state-web/src/main/resources/META-INF/resources/State.ts), and likewise for `useLiferayState`, which lives [in `frontend-js-react-web`](https://github.com/liferay/liferay-portal/blob/d0d7e3ea746da907234e1f838d70d3b8bd458a5e/modules/apps/frontend-js/frontend-js-react-web/src/main/resources/META-INF/resources/js/hooks/useLiferayState.ts).

#### Using the API with TypeScript

One of the key benefits of this API is that it provides type-safety if you access it and the corresponding atoms and selectors using [TypeScript](https://www.typescriptlang.org/). In many cases, TypeScript is even able to infer the type of the values without requiring you to explicitly annotate them. For instance, the following (contrived) example — which [you can apply](https://gist.github.com/wincent/2d1e822e6a3478488a5036fcaff1f30b) to the `frontend-js-clay-sample-web` widget if you'd like to try it out — shows how two components can share information via atoms and selectors. Even though there are no explicit type annotations, TypeScript (and therefore [LSP](https://microsoft.github.io/language-server-protocol/)-based editor tooling) can determine that the `sample-atom` contains a value of type `string`, and `sample-selector` returns a `string` too. For illustration, these atoms, selectors, and components are defined right next to each other, but in real applications you obviously would only be using the global shared state API for things that were actually global:

```tsx
import {useLiferayState} from '@liferay/frontend-js-react-web';
import {State} from '@liferay/frontend-js-state-web';

// Shared state (atoms and selectors); normally these would be in a separate
// files.

const userAtom = State.atom('sample-atom', {
	name: Liferay.ThemeDisplay.getUserName(),
});

const userSelector = State.selector('sample-selector', (get) => {
	const user = get(userAtom);

	return `${user.name} (${user.name.length})`;
});

// Components that access that shared state; again, these would normally be
// in different files.

function Name() {
	const [userNameAndLength] = useLiferayState(userSelector);

	return (
		<ClayCard>
			<ClayCard.Body>
				<ClayCard.Description displayType="title">
					{Liferay.Language.get('name')}
				</ClayCard.Description>
				<ClayCard.Description displayType="text" truncate={false}>
					{userNameAndLength}
				</ClayCard.Description>
			</ClayCard.Body>
		</ClayCard>
	);
}

function NameUpdater(portletId) {
	const id = `${portletId}_form`;
	const [user, setUser] = useLiferayState(userAtom);

	return (
		<ClayForm.Group>
			<label htmlFor={id}>Name</label>
			<ClayInput
				id={id}
				onChange={(event) => {
					setUser({
						...user,
						name: event.target.value,
					});
				}}
				type="text"
				value={user.name}
			/>
		</ClayForm.Group>
	);
}

export default ({portletId}) => {
	return (
		<div className="col-md-6">
			<NameUpdater portletId={portletId} />
			<Name />
		</div>
	);
};
```

For more information about how TypeScript is configured and built inside DXP, see ["TypeScript build support in Liferay DXP"](../../projects/npm-tools/packages/npm-scripts/src/typescript/README.md). For general guidance about and resources for learning TypeScript, see [our TypeScript guidelines](../general/typescript.md).

#### Using the API without TypeScript

As noted above, one of the major selling points of the TypeScript-based API is that it makes dealing with the inherently dangerous concept of global shared state quite a bit safer. That is, if you know something should have a shape like `{name: string}`, but can be mutated from literally anywhere in the repo, it is comforting to know that, no matter what happens, at least you can be sure you'll always be dealing with a value of shape `{name: string}` and not something unexpected like `null`, `boolean`, or `'Torschlusspanik'`.

Unfortunately, rewriting all of DXP in TypeScript is going to take a while, and we anticipate that there will probably be remnants of inline JS hidden away in JSP files for the foreseeable future. To serve those legacy use cases where it may not be practical or possible to write in TypeScript, or to obtain a reference to a concrete atom or selector, we have an "escape hatch" API hiding under the `Liferay.State.__unsafe__` namespace which can be used to look up and interact with atoms and selectors via their string keys.

This usage is considered unsafe because it bypasses the static type checking provided by the main API (`read()`, `write()` etc). Given that the integrity of global shared state largely depends on the values being of a predictable and correct type, you should use the `__unsafe__` API only as a last resort. Instead, consider moving legacy code out of JSPs and into places where it can fully participate in the module-loading system and thus access concrete atoms and selectors by importing them. At the same time, moving legacy code into React components provides access to the `useLiferayState()` hook and other conveniences, and if you are going to do that, you should consider moving them to TypeScript at the same time.

The following methods exist in the `__unsafe__` API. When running with `NODE_ENV` set to `development` ([highly recommended](./environment.md)), the first call to each method will log a warning to the console reminding you of the dangers involved in access that isn't type-safe. Be aware that if you do an unsafe _read_, you are flying blind in your own code. If you do an unsafe _write_, you are weakening the type guarantees for every other potential caller in the codebase, even the ones that are using TypeScript. So please, use these methods sparingly:

-   `readKey(key)`: Returns the current value of the atom or selector identified by the (`string`) `key`. The return type of this method is, naturally, `unknown`.
-   `subscribeKey(key, callback)`: Registers for `callback` to be notified whenever the current value of the atom or selector identified by the (`string`) `key` changes. `callback` will be called with a value of type `unknown` for any updates. This method returns an object with a `dispose()` method that you can call when you wish to cancel your subscription.
-   `writeKey(key, value)`: Sets the value of the atom identified by the (`string`) `key`. Like the other methods, the type of `value` is considered to be `unknown`. Note that it is invalid to attempt to write to a _selector_; to update a selector, you should instead update one or more atoms that appear in its dependency graph, which will cause the value of the selector to be automatically re-derived.

### When to use the global state API

The general rule of thumb remains:

> Keep state as close as possible to where it is needed.

This means that you should only use the global state API for things that actually _need_ to be **global**. For most applications, a tool like [React context](https://reactjs.org/docs/context.html) is the broadest thing you'll ever need, and when your needs can be fulfilled with narrower tools (like the `useState` hook), you should reach for those first.

However, sometimes you really do need state to be globally visible because there is no direct connection between the elements that need to be coordinated around that state, or because you don't even know ahead of time _which_ components might be interested in a particular piece of data, even though you know that _some_ components may.

### Limitations

By design, the initial version of the global state API eschews features like automatic persistence to `localStorage`, or garbage collection, as well as many of the more complicated concepts in the Recoil library (like "atom families", "selector families", asynchronous values, batched updates and so on). We may evaluate the addition of such features in the future, but for now we're starting simply.

Because the mental model for the global state API is "big bag of key-value pairs with some sugar on top", it's important to bear in mind scalability and performance considerations. For example, storing massive objects inside Atoms is probably not a good idea. Values stored in atoms are expected to be immutable, so you should never modify a value that you have obtained from the API; you must always make a copy and modify that instead (after which you can write it back to API, thereby notifying all subscribers). This is enforced when accessing the API via TypeScript, but this is obviously not the case when using the unsafe API or accessing from vanilla JavaScript. Given the difficulty of manipulating large immutable objects, you should try to structure your data in terms of smaller atoms and selectors that are easier to update.

For similar reasons, beware of globbing together too much data in a single atom or selector. If an atom or selector becomes a "kitchen sink" of interesting values, then it will wind up having too many subscribers, and they will _all_ receive updates even when the part of the "kitchen sink" that they actually care about wasn't updated. Prefer granular units that permit granular access.

## Further reading

-   ["Application State Management with React"](https://kentcdodds.com/blog/application-state-management-with-react).
