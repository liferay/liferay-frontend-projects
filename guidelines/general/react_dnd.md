# React Dnd

react-dnd is a powerful and flexible drag and drop library for React, but there are some gaps in its documentation. Anyway, this is not intended to be a full replacement of react-dnd docs but just some guides and tips to use it on a React application via hooks. For full API reference visit https://react-dnd.github.io/react-dnd/

## Backend Provider

react-dnd requires your dnd-ready apps to be wrapped inside what they call a backend provider in order to work. There're two main backends the library provides: HTML5, for regular mouse events, and Touch, for touch events.

```
import Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

export default function MyReactApp() {
  return (
    <DndProvider backend={Backend}>
      /* your drag-and-drop application */
    </DndProvider>
  )
}
```

## useDrag

First thing you need to configure is your draggable elements using the `useDrag` hook.

```
const [{isDragging}, drag, preview] = useDrag({
		collect: monitor => ({
			isDragging: !!monitor.isDragging(),
		}),
		item: {
            id,
            type: ACCEPTING_TYPES.ITEM
        },
	});
```

### Return value array

`useDrag` returns an array of three values:

-   `Index 0`: An object containing collected properties from the collect function. If no collect function is defined, an empty object is returned.
-   `Index 1`: A connector function for the drag source. This **must** be attached to the draggable portion of the DOM.
-   `Index 2`: A connector function for the drag preview. This may be attached to the preview portion of the DOM in case you want to overwrite the default drag preview behavior.

### Hook config object (most important properties)

-   `item`: Required. This is the only information about the draggable item that will be available for the drop or custom drag layer objects, so you need to place here any information you'll need on your drop logic.

    `item.type` is also required, only drop targets registered for the same type will react to this drag.

-   `collect`: Optional. This is a function that receives `monitor` and `props`, and must return a plain object that you'll receive as the first array element of the hook return value.

### Connect drag with DOM element

You can connect drag with an element in two different ways:

-   Setting `drag` returned parameter as your element's `ref`.

```
return (
    <div ref={drag}>
        ...
    </div>
);
```

-   Creating your own ref.

```
const ref = useRef();

drag(ref);

return (
    <div ref={ref}>
        ...
    </div>
);
```

## useDrop

Once the drag element is configured you can set your drop element(s) using `useDrop`.

```
const [{isOver}, drop] = useDrop({
		accept: ACCEPTING_TYPES.ITEM,
		canDrop(source, monitor) {
			return isValidTarget(source, monitor);
		},
		collect: monitor => ({
			isOver: !!monitor.isOver(),
		}),
		drop(source, monitor) {
			if (monitor.canDrop()) {
				onItemDrop(source, monitor);
			}
		},
		hover(source, monitor) {
			if (monitor.isOver() && monitor.canDrop()) {
                onItemDropHover(source, monitor)
			}
		}
	});
```

### Return value array

`useDrop` returns an array of two values:

-   `Index 0`: An object containing collected properties from the collect function. If no collect function is defined, an empty object is returned.

-   `Index 1`: A connector function for the drop target. This **must** be attached to the drop-target portion of the DOM.

### Hook config object (most important properties)

-   `accept`: Required. This must be set with the item type you want drop to accept.

-   `canDrop`: Optional. Use it to specify whether the drop target is able to accept the item. If you want to always allow it, just omit this method.

-   `collect`: Optional. This is a function that receives `monitor` and `props`, and must return a plain object that you'll receive as the fist array element of the hook return value.

-   `drop`: Called when a compatible item is dropped on the target.

-   `hover`: Called when an item is hovered over the component. You can check `monitor.isOver({ shallow: true })` to test whether the hover happens over just the current target, or over a nested one. Unlike drop(), this method will be called even if `canDrop()` is defined and returns false. You can check `monitor.canDrop()` to test whether this is the case.

### Connect drop with DOM element

You can connect drop with an element in two different ways:

-   Setting `drop` returned parameter as your element's `ref`.

```
return (
    <div ref={drop}>
        ...
    </div>
);
```

-   Creating your own `ref`.

```
const ref = useRef();

drop(ref);

return (
    <div ref={ref}>
        ...
    </div>
);
```

## Connecting drag and drop with the same DOM element

Sometimes you need your drag item to be also a drop one. To do it just call returned `drag` and `drop` returned values in this way (it's recommended to do it inside a useEffect to minimize useless re-renders):

```
useEffect(() => {
    drag(drop(ref));
}, [drag, drop]);

return (
    <div ref={ref}>
        ...
    </div>
);
```
