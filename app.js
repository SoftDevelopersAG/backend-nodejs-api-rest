const express = require('express');
const app = express();
const morga = require('morgan')
const bodyParser = require('body-parser')

const connect = require('./database/collection/connectionDB')

const services = require('./routes/api/v0.1/services')
const roles = require('./database/collection/setupConfigRoles/setupConfigRoles')
roles()
const PORT = process.env.PORT || 4000;

app.use(morga('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// Environment for development
app.use('/',services)


// Environment for production
app.use('/api/v0.1',services)





app.listen(PORT,()=>{
    console.log(`Api-Rest runing in port : http://localhost:${PORT}`)
})