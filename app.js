"use strict";

const morga = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

const {app, server} = require("./sockets/config");

// const connect = require("./database/collection/connectionDB");
const services = require("./routes/api/v0.1/services");
const roles = require("./database/collection/setupConfigRoles/setupConfigRoles");


const {socketEmit} = require("./sockets/config")
const {CHAT_MESSAGE} = require("./sockets/eventTypes")


// roles();


const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(morga("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Environment for development
app.use("/", services);

// Environment for production
app.use("/api/v0.1", services);



app.get("/", (req, res, next) => {
  socketEmit(CHAT_MESSAGE, "toby from apppppp");
  res.status(200).send({ messagae: "app " })

});

server.listen(PORT, () => {
  console.log(`Api-Rest runing in port : http://localhost:${PORT}`);
});