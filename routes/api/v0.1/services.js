
'use strict'
const express = require('express');
const route = express.Router();
const Auth = require('../../../middleware/auth');
const  AccessRoleControl = require('../../../middleware/acessRoleControl/acessRoleControl')
const socketControllers = require('../../../socket/controllers/socketControllers');
const PaymentConrtol = require('./businesLogic/usageControl');

// import source negocio
const Negocio = require('./businesLogic/negocio')

// const io = require('../../../app')


const User = require('./businesLogic/user')
//salas
const SalasRoutes = require('./businesLogic/salas');
//mesas
const Mesa = require('./businesLogic/mesas');
//menu
const Menu = require('./businesLogic/menu');

const EstadoFinanciero = require('./businesLogic/estadoFinanciero');

//imagen
const {uploadFileFotoProducto} = require('../../../Utils/uploadFile');


route.get('/',(req, res, next)=>{
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
route.post('/user/signin', User.signIn)
  //muestra la lista de usuarios de acuerdo al parametro state que puede ser active, inactive, all 
route.get('/user/list/state=:state',[Auth, /* AccessRoleControl.isAdmin, */ AccessRoleControl.isCajero], User.showListUser)
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


//generate license
route.get('/cliente/generate/licence', User.generateLicence);
route.post('/cliente/verify/licence', User.verifiLisence);

// :::::::::::::::NEGOCIO:::::::::::::::::
route.post('/negocio/create',[Auth, AccessRoleControl.isAdmin], Negocio.createNegocio );

route.get('/negocio/detail/idnegocio=:idnegocio', Negocio.showNegocioId)
    // update data negocio 
route.put('/negocio/update',[Auth, AccessRoleControl.isAdmin], Negocio.updateDataNegocio);
    // dar de baja un negocio
route.delete('/negocio/delete',[Auth, AccessRoleControl.isAdmin], Negocio.deleteNegocio);
     // control de pagos del servicio
route.get('/negocio/payment/control/show/idnegocio=:idnegocio', PaymentConrtol.checkPaymentControl)

// :::::::::::::::estado financiero::::::::::::::::::::
route.post('/financiero/state', EstadoFinanciero.createEstadoFinanciero);



/* =======================salas=============================== */
route.post('/salas/create/:idUser', SalasRoutes.create);
route.get('/salas/list', SalasRoutes.list);

/* =======================Mesas=============================== */
route.post('/mesas/create/:idSala', Mesa.create);
route.get('/mesas/list/:idSala', Mesa.list);

/* =======================Producto=============================== */
route.post('/menu/create/:idUser', Menu.create);
route.get('/menu/list', Menu.list);

//registrar las imagenes
route.post('/image/product/:idmenu', uploadFileFotoProducto);








module.exports = route;
