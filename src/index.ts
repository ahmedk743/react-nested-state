import { useCallback, useMemo, useState } from "react";

type SettersFor<U> = {
  [K in keyof U]: U[K] extends Array<infer T>
    ? { set: (value: T[] | ((prev: T[]) => T[])) => void } & Array<
        SettersFor<T>
      >
    : U[K] extends object
    ? { set: (value: U[K] | ((prev: U[K]) => U[K])) => void } & SettersFor<U[K]>
    : { set: (value: U[K] | ((prev: U[K]) => U[K])) => void };
};

type ReturnTypes<T> = [
  T,
  SettersFor<T> & { set: (value: T) => void },
  () => void
];

/**
 * This hook is used to manage nested state.
 * It returns the state, setters and a reset function.
 * The setters are generated recursively based on the initial state.
 * The setters are memoized so that they are not re-generated on every render.
 * The reset function resets the state to the initial state.
 * @param initialState The initial state
 * @returns [state, setters, reset]
 * @example
 * const initialState = {
 *  name: "John",
 *  age: 20,
 *  a: {
 *   b: {
 *    c: 10
 *   }
 * },
 *
 * const [state, setters, reset] = useNestedState(initialState);
 * setters.name.set("Jane");
 * setters.age.set(21);
 * setters.a.b.c.set(11);
 */
export const useNestedState = <T extends object>(initialState: T) => {
  const [state, setState] = useState(initialState);

  const createSetter = useCallback((path: string[]) => {
    return (value: any) => {
      setState((prevState) => {
        const newState = { ...prevState };
        let currentLevel: any = newState;

        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          currentLevel[key] = { ...currentLevel[key] };
          currentLevel = currentLevel[key];
        }

        const lastKey = path[path.length - 1];
        if (typeof value === "function") {
          currentLevel[lastKey] = value(currentLevel[lastKey]);
        } else {
          currentLevel[lastKey] = value;
        }

        return newState;
      });
    };
  }, []);

  const generateSetters = useCallback((obj: any, path: string[] = []) => {
    const setters: any = {};
    if (!obj) return setters;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const currentPath = path.concat([key]);
      if (Array.isArray(value)) {
        setters[key] = {
          set: createSetter(currentPath),
        };
      } else if (typeof value === "object") {
        setters[key] = {
          set: createSetter(currentPath),
          ...generateSetters(value, currentPath),
        };
      } else {
        setters[key] = {
          set: createSetter(currentPath),
        };
      }
    });
    setters.set = createSetter(path);
    return setters as SettersFor<T>;
  }, []);

  /**
   * Resets the state to the initial state
   * @example
   * const [state, setters, reset] = useNestedState(initialState);
   * reset();
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const setters = useMemo(
    () => generateSetters(initialState),
    [initialState, generateSetters]
  );

  return [state, setters, reset] as ReturnTypes<T>;
};
