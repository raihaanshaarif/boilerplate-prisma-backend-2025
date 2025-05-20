export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
) => {
  // console.log(obj, keys);
  const finalObj: Partial<T> = {};

  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      // console.log(key);
      finalObj[key] = obj[key];
    }
  }
  // console.log(finalObj);
  return finalObj;
};
