import { useState, useEffect } from "react";

const getLocalValue = (key, initValue) => {
  //SSR server side rendering like nextJS
  if (typeof window === "undefined") {
    return initValue;
  }

  //if value is in local storage then return it
  const localValue = JSON.parse(localStorage.getItem(key));
  if (localValue) return localValue;

  //if value is not in local storage then return initial value
  if (initValue instanceof Function) {
    //if init value is func call it then return the value
    return initValue();
  } else {
    return initValue;
  }
};

const useLocalStorage = (key, initValue) => {
  const [value, setValue] = useState(() => {
    return getLocalValue(key, initValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
