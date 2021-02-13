/**
 * Here you can define helper functions to use across your app.
 */

/**
 * @desc setTimeout wrapped in a promise
 * @param {Number} time 
 * @returns {Promise}
 */
export function delay(time) {
  return new Promise((reslove) => {
    setTimeout(() => { reslove(); }, time);
  });
}