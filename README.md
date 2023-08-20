# react-nested-state

The `react-nested-state` library provides a convenient way for React developers to manage and update nested states within functional components. It offers a hook called `useNestedState` that simplifies the process of setting nested states and provides easy-to-use setters for various levels of nesting. This can be particularly useful when dealing with complex state structures.

## Installation

You can install the `react-nested-state` library using npm:

```bash
npm install react-nested-state

## Example


```

const [state, setters, reset] = useNestedState(initialState);

```
const initialState = {
  name: "John",
  age: 20,
  a: {
   b: {
    c: 10
   }
 },

 ...

 const [state, setters, reset] = useNestedState(initialState);
 setters.name.set("Jane");
 setters.age.set(21);
 setters.a.b.c.set(11);

```
