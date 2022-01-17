
'use strict'
const express = require('express');
const morga = require('morgan')

const app = express();

const bodyParser = require('body-parser')
const cors = require('cors')

const http = require('http');
const socketIo = require('socket.io');

const path =  require('path');


// backups DB
const backupDb = require('./database/collection/backupsDB/generateBackup');


const connect = require('./database/collection/connectionDB')

const services = require('./routes/api/v0.1/services')
const roles = require('./database/collection/setupConfigRoles/setupConfigRoles');
// const { consumers } = require('stream');

roles()


const PORT = process.env.PORT || 4000;


app.use(morga('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use(cors());
const publicDirectoryPath = path.join(__dirname, 'public');

app.use(express.static(publicDirectoryPath));

// Environment for development
app.use('/',services)


// Environment for production
app.use("/api/v0.1", services);


// configuracion de socketio
const server = http.createServer(app)
global.io  = socketIo(server,{
    cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket)=>{
    console.log('socket conected: ', socket.id)
    socket.on('meesage',body=>{
        console.log(body);
        socket.broadcast.emit('message',{
            body,
            form : socket.id.slice(8)
        })
    })
    socket.on('disconnect',()=>{
        console.log('socket disconnect: ', socket.id)

    })
})


const listName = ['chapita', 'carmen']
app.get('/listnames',(req,res)=>{
res.json(listName)
});


app.post('/listnames',(req,res)=>{
    listName.push(req.body.name)
    io.emit('[user] addNewUser',listName)
    console.log(Object.keys(io))
    // console.log(io)
    
});




server.listen(PORT,()=>{
    console.log(`Api-Rest runing in port : http://localhost:${PORT}`)
})


// importacion del modulo de socketio
// module.exports = socketIo(server);
