const { CHAT_MESSAGE } = require("./eventTypes");

const eventsList = [];

// function handleMessageEvent(...args){
//     console.log(typeof args);
//     console.log("message received", args);
// }

// addNewEventListeners(CHAT_MESSAGE, handleMessageEvent);


addNewEventListeners(CHAT_MESSAGE, (...args)=>{
    console.log(typeof args);
    console.log("message received", args);
});

function addNewEventListeners(eventName, callback) {
  eventsList.push({
    eventName: eventName,
    callback: callback,
  });
}

module.exports = {
  eventsList
};
