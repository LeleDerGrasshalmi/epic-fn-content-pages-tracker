/* eslint-disable @typescript-eslint/no-unsafe-return */
const recursiveJsonSort = <T = unknown>(obj: T): T => {
  if (!obj) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return <T>obj
      .map((x) => recursiveJsonSort(x));
  }

  if (typeof obj === 'object') {
    const sortedEntries = Object.entries(obj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, recursiveJsonSort(value)]);

    return Object.fromEntries(sortedEntries);
  }

  return obj;
};

export default recursiveJsonSort;
