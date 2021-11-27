// "use strict";

// const express = require("express");
// const app = express();
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");

// const { eventsList } = require("./eventListeners");

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("new user conected->>>>>>>>>>>>>");

//   eventsList.forEach(({ eventName, callback }) => {
//     socket.on(eventName, (...args) => {
//       callback(...args);
//     });
//   });
// });



// function socketEmit(socketName, data) {
//   if (socketName.length === 0) {
//     return new Error("name of socket event not provided");
//   }

//   io.emit(socketName, data);
// }

// module.exports = {
//   app,
//   server,
//   socketEmit,
// };
