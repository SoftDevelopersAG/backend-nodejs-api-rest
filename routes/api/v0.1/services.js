
const express = require('express');
const route = express.Router();
const Auth = require('../../../middleware/auth');
const  AccessRoleControl = require('../../../middleware/acessRoleControl/acessRoleControl')

const User = require('./businesLogic/user')

route.get('/home',(req, res, next)=>{
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
route.post('/user/signin', User.signIn)
  //muestra la lista de usuarios de acuerdo al parametro state que puede ser active, inactive, all 
route.get('/user/list/state=:state',[Auth, AccessRoleControl.isAdmin], User.showListUser)
route.put('/user/update', User.editDataUser );
   // agregar nuevo role un determanido usuario
route.put('/user/add/newrole/:idUser', User.addNewRole);
    // remover o quitar un ro de un determario usuario
route.put('/user/remove/role', User.removeRoleUser);

//verificar si token esta vigente
route.get('/api/verifyToken/:idUser', Auth, User.simpleRute);

//udpate user datas
route.put('/user/updateUser/:idUser', User.editPersonalData);
//lista de roles del usuario
// a esta ruta tienen que poder entrar todos los roles ya que esto es verificado para las rutas en el cliente
// con esta ruta podemos ver quien tiene que rol para ver a donde hay acceso en el cliente
route.get('/user/roleList/:idUser', User.userRoleList);
//update state user
route.patch('/user/update/state/:idUser', User.updateStateUser);

module.exports = route;
