import useLocalStorage from "./useLocalStorage";

const useToggle = (key, initValue) => {
  const [value, setValue] = useLocalStorage(key, initValue);

  const toggle = (value) => {
    //this works as state we can use prev
    setValue((prev) => {
      return typeof value === "boolean" ? value : !prev;
    });
  };
  return [value, toggle];
};

export default useToggle;
