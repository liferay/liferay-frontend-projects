# Testing

Testing is a large topic, so in this document we cover high-level principles, and have split off some more specific guidelines in the following files:

-   [Supported libraries](./supported_libraries.md)
-   [Testing UI components](./ui_components.md)
-   [Anatomy of a test](./anatomy.md)

## High-level principles

### Write user-centric tests

> Focus on user-perceptible behavior, not implementation details.

Make assertions about the results of operations rather than how they are produced. Users care that when they click "Add item" in a list, a new item is added to the list; they don't care, however, that a click event is handled by the `Frizzknob` which updates its internal `_gizmos` property.

Always ask yourself when writing an assertion:

> Does the behavior that I am about to assert _matter_ to the user?

If it doesn't, then perhaps there is an alternative assertion that you could write that _does_ matter to the user and still ends up exercising the functionality that you were wanting to target with your original idea. Such an assertion is likely to be more valuable, and also less likely to break in the future: implementation details change much more often than user-perceptible behavior.

Note that this _doesn't_ mean that you can never test an implementation detail — it may still be worthwhile writing a low-level test for something that seems relatively internal if you have reason to believe that it is tricky (ie. it might be hiding a bug), or to prevent a regression — the intention is just to guide your (finite) testing budget towards the things that are more likely to matter.

### Use mocks sparingly

Mocks have an obvious usefulness at the perimeter of your application (for example, at the network) so that you can verify aspects of the interaction with the surrounding context. In the case of the network, you probably don't want your tests communicating over the wire anyway (that just makes things slow and brittle). The other big liability of mocks is that they may isolate you _too well_ from things that could break your tests, concealing legitimate failures: for example, if you stub some other method to always return `x`, of course your tests will still pass even when the other method is broken, because your mock isolated you from the reality of the bug. The "benefits" of such isolation (test speed, independence) are massively overrated: avoid the mocks, let the tests be mini "integration" tests instead.

Mocks seldom have value _inside_ the boundaries of your application. If you focus on behavior that users value, then you won't often find yourself needing to assert that when you call `doSomething()`, `A` calls `B` with `x` behind the scenes and then gets `y` back. Rather, you'd be asserting that when you call `doSomething()`, then at the end, the state of the world matches your expectations (eg. file system now has a file on it with certain contents, or screen shows new item at bottom of list).

One way to think about this is of tests as testing "black box" functionality:

> _Black box testing mindset_
>
> Prepare the environment of the black box, perform an action on the black box, then verify the expected side effect in the environment (and if the action had no side effect, why would you test it?).
>
> ... in contrast with ...
>
> _Interaction/mock testing mindset_
>
> Perform an action on some piece of code under test, then verify that internally, some element communicated with some element using an expected value.

### Write tests for the reader, not the writer

In software development, we try to balance a number of nebulous concepts like "readability", "maintainability", and "ergonomics". This in turn leads to maxims like "[Don't Repeat Yourself](http://wiki.c2.com/?DontRepeatYourself)" (DRY).

> In test code, it is **even more important that code be readable and intention-revealing**. Don't worry about duplication in tests: it may actually be a good thing.

Think from the perspective of the person that is looking at a test failure in CI, in code that they didn't write and may not understand. They _should not have to reverse-engineer the test_ to figure out what the code is supposed to be doing. Instead, they should be able to read it from top-to-bottom and see it all spelled out in a very clear, pedestrian way, without having to jump through a list of calls to helper functions.

> In tests, **dumb is the new clever**.

### Concrete recommendations

#### Assert (ie. `expect()`) one thing per `it()` block

Instead of:

```javascript
describe('prepareConfig()', => {
  it('generates the right config', () => {
    const config = prepareConfig({preset: 'default'});

    expect(config).not.toBe(null);
    expect(Object.isFrozen(config)).toBe(true);
    expect(config.plugins).toEqual([]);

    expect(() => prepareConfig({preset: 'standard'}))
      .toThrow(/Unknown preset/);
  });
});
```

write:

```javascript
describe('prepareConfig()', => {
  let config;

  beforeEach(() => {
    config = prepareConfig({preset: 'default'});
  });

  it('returns a non-null configuration', () => {
    expect(config).not.toBe(null);
  });

  it('returns a frozen object', () => {
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('includes plugin configuration', () => {
    expect(config.plugins).toEqual([]);
  });

  it('rejects unknown preset names', () => {
    expect(() => prepareConfig({preset: 'standard'}))
      .toThrow(/Unknown preset/);
  });
});
```

By creating small, targeted `it()` blocks:

-   A failure early on in the `it()` block does not preclude the other assertions from being evaluated.
-   These assertions more readable if you look at it in isolation (because each one is simpler).
-   They are also more intention-revealing.
-   The test output now serves as better documentation of the expected behavior, because we see:

    ```
      prepareConfig()
        ✓ returns a non-null configuration (54ms)
        ✓ returns a frozen object (3ms)
        ✓ includes plugin configuration (10ms)
        ✓ rejects unknown preset names (4ms)
    ```

    instead of just:

    ```
      prepareConfig()
        ✓ generates the right config (103ms)
    ```

> **Note:** Aiming for one assertion per block is a guideline, not a hard-and-fast rule. As argued in "[Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests)", going too far with this approach can be counter-productive. Writing good tests requires judgement. If it helps, think of this guideline not as "one assertion per block" but rather as **get as close as you can to one assertion per block _without actually making things worse_**.

#### Don't dynamically create `describe()` and `it()` blocks

Instead of:

```javascript
['left', 'right', 'center'].forEach((position) => {
	describe(`positioning controls at the ${position}`, () => {
		it('has a matching position property', () => {
			expect(getControl(position).position).toBe(position);
		});
	});
});
```

write:

```javascript
describe('positioning controls to the left', () => {
	it('has a position property of "left"', () => {
		expect(getControl('left').position).toBe('left');
	});
});

describe('positioning controls to the right', () => {
	it('has a position property of "right"', () => {
		expect(getControl('right').position).toBe('right');
	});
});

describe('positioning controls in the centre', () => {
	it('has a position property of "center"', () => {
		expect(getControl('center').position).toBe('center');
	});
});
```

This (contrived) example is one where your intuition may be to ["DRY" up the code, but consider the position of the person who reads a report of a "test failure on line 123"](#write-tests-for-the-reader-not-the-writer) and now has to figure out which iteration of the loop. It's better for them if we spell out each example alone.

#### Optimize assertions for readability when failure occurs

Avoid assertions like:

```javascript
expect(fruits.includes('apple')).toBe(true);
```

which will produce a failure message like:

> `expected value to be: true, received: false`

Instead, use:

```javascript
expect(fruits).toContain('apple');
```

which will produce a much more informative failure message like:

> `expected array ["pear", "orange"] to contain value "apple"`
