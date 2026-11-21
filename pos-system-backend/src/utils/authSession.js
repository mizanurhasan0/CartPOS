
/**
 * this function is used to set session in global variable.
 * @param {string} store set store id
 * @param {string} session socket session
 * @param {string} user user id
 */
export function setSession(store, user) {
  global.session[store].push(user);
}


/**
 * this function is used to remove session from global variable.
 * @param {string} store set store id
 * @param {string} session socket session
 */
export function removeSession(store, user) {
  // find user array index
  const oldSession = [...global.session[store]];
  const index = global.session[store].indexOf(user);

  // set new array into store session
  if (index !== -1) {
    oldSession.splice(index, 1);
    global.session[store] = oldSession;
  }
}


/**
 * this function is used to check store session length.
 * @param {string} store set store id
 */
export function sessionLength(store) {
  // check store session length
  if (!global.session[store]?.length) return 0;
  return global.session[store].length;
}
