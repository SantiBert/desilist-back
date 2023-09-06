import {inspect} from 'util';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === 'object' &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

export const hasNullProp = (obj: Record<string, any>): boolean => {
  let check = false;
  for (const prop in obj) {
    if (!obj[prop]) {
      check = true;
      break;
    }
    switch (typeof obj[prop]) {
      case 'object':
        check = hasNullProp(obj[prop]);
        break;
    }
  }
  return check;
};

export const removeKeys = (obj: Record<string, any>, keys: string[]): void => {
  let index: number;
  for (const prop in obj) {
    // important check that this is objects own property
    // not from prototype prop inherited
    if (obj.hasOwnProperty(prop)) {
      switch (typeof obj[prop]) {
        case 'string':
          index = keys.indexOf(prop);
          if (index > -1) {
            delete obj[prop];
          }
          break;
        case 'object':
          index = keys.indexOf(prop);
          if (index > -1) {
            delete obj[prop];
          } else {
            removeKeys(obj[prop], keys);
          }
          break;
      }
    }
  }
};

export const safeInspect = (
  object: any,
  skip: string[] = [],
  showHidden?: boolean,
  depth?: number,
  color?: boolean
): string => {
  const newObj = JSON.parse(JSON.stringify(object));
  if (skip.length > 0) {
    removeKeys(newObj, skip);
  }
  return inspect(newObj, showHidden, depth, color);
};
