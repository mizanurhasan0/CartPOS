

/**
 * This function is used for notify all store user.
 * @param {Object} ws ws is instance of socket object.
 * @param {String} room Room is name of the store.
 * @param {String} event event is name of event which emit to user.
 * @param data - data is payload any type of data.
 */
export const sendNotification = async ({ ws, room, event, data }) => {
  try {
    ws.to(room).emit(event, data);
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong");
  }
}
