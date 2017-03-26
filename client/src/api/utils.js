export const post = (dataUrl, body) =>
  (dataUrl
  ? fetch(dataUrl, { method: 'POST', body })
  : Promise.resolve());

export const stringEndsWith = (str, suffix) =>
  str.length >= suffix.length && str.substr(str.length - suffix.length) === suffix;
