
'use strict'
const express = require('express');
const route = express.Router();
const Auth = require('../../../middleware/auth');
const  AccessRoleControl = require('../../../middleware/acessRoleControl/acessRoleControl')
const socketControllers = require('../../../socket/controllers/socketControllers')

// import source negocio
const Negocio = require('./businesLogic/negocio')

// const io = require('../../../app')


const User = require('./businesLogic/user')


route.get('/home',(req, res, next)=>{
    res.status(200).send({"messagae":"Api-rest food sales system runing"})
})


// endpoint test socket-io
// io.on('connection',()=>{
//     console.log('socket services connected')
// })

const users=[];

route.get('/socket/name=:name',(req, res, next)=>{
    console.log(req.params.name);
    users.push(req.params.name)
    // console.log(Object.keys(io.defalut.sockets))
    
    socketControllers('[user] addNewUser',users);
    
    res.status(200).send({'lista de usuarios':users})
})

// end point for test how use middleware and access role control
route.get('/showdata', [Auth, AccessRoleControl.isAdmin],  (req, res, next)=>{
    res.status(200).send({message:'show all data'})
})

route.get('/products/list', [Auth, AccessRoleControl.isUser],  (req, res, next)=>{
    res.status(200).send({message:'show list data products'})
})


// ::::::::::user:::::::::::::::::
route.post('/user/signup', User.signUp)
route.get('/user/signin', User.signIn)
  //muestra la lista de usuarios de acuerdo al parametro state que puede ser active, inactive, all 
route.get('/user/list/state=:state',[Auth, AccessRoleControl.isAdmin], User.showListUser)
route.put('/user/update', User.editDataUser );
   // agregar nuevo role un determanido usuario
route.put('/user/add/newrole', User.addNewRole);
    // remover o quitar un ro de un determario usuario
route.put('/user/remove/role', User.removeRoleUser);



// ::::::::::negocio:::::::::::::::::
route.post('/negocio/create', Negocio.createNegocio )



module.exports = route;
