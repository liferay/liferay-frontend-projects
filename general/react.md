# React

## Avoid using array indices for the `key` attribute

A common anti-pattern in React components is the unnecessary use of array indices as `key` values:

```javascript
<ProductDashboard>
	{products.map(({cost, description, name, sku}, i) => (
		<Product
			cost={cost}
			description={description}
			key={i}
			name={name}
			sku={sku}
		/>
	))}
</>
```

It's best to avoid index-based `key` values — which are merely _positional_ — whenever you have an alternative that is more closely related to the _identity_ of an element. In example above, the [SKU](https://en.wikipedia.org/wiki/Stock_keeping_unit) ("Stock Keeping Unit") is a unique identifier and would be a great choice for the `key` attribute.

The reason is that React uses the `key` as a hint to figure out how to best reconcile the DOM in a minimal way when changes are made. Imagine that your have a list of fruits which you render in two different states:

| First render | Second render |
| ------------ | ------------- |
| 1. Apple     | 1. Apple      |
| 2. Banana    | 2. Banana     |
| 3. Pear      | 3. Pear       |
| 4. Orange    | 4. Apricot    |
| 5. Apricot   | 5. Peach      |
| 6. Peach     |               |

Consider what happens during the second render, having filtered the list so that "Orange" won't get rendered any more:

-   If you use the _names_ as keys, React can figure out that item "4. Orange" should be removed from the DOM, which is a single operation.
-   If you use the _indices_ as keys, React thinks you're telling it that item 4's name changed from "Orange" to "Apricot", item 5's name changed from "Apricot" to "Peach", and item 6 was removed, which is three operations.

For much more detail, see [the React docs on reconciliation](https://reactjs.org/docs/reconciliation.html#recursing-on-children):

> As a last resort, you can pass an item's index in the array as a key. This can work well if the items are never reordered, but reorders will be slow.
