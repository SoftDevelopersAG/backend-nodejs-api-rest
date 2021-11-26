
const express = require('express');
const route = express.Router();
const Auth = require('../../../middleware/auth');
const  AccessRoleControl = require('../../../middleware/acessRoleControl/acessRoleControl')

const User = require('./businesLogic/user')


const {socketEmit} = require("../../../sockets/config");
const { CHAT_MESSAGE } = require("../../../sockets/eventTypes");

route.get('/home',(req, res, next)=>{
    socketEmit(CHAT_MESSAGE, "TOBY HOME");
    
    res.status(200).send({"messagae":"Api-rest food sales system runing"})
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



















module.exports = route;
