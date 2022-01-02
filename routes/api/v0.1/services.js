
'use strict'
const express = require('express');
const route = express.Router();
const Auth = require('../../../middleware/auth');
const  AccessRoleControl = require('../../../middleware/acessRoleControl/acessRoleControl')
const socketControllers = require('../../../socket/controllers/socketControllers');
const PaymentConrtol = require('./businesLogic/usageControl');
const Ventas = require('./businesLogic/ventas');
const Products = require('./businesLogic/productos');

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

//clientes
const Clientes =require('./businesLogic/clientes')
//gastos y tipo de gastos y tipo
const Gastos = require('./businesLogic/gastos');

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

/* // ::::::::::register admin::::::::::::::::: */
route.post('/user/registerAdmin', User.registerAdmin);
route.post('/user/validateDatasUser', User.verifiDatasUser );


/* // ::::::::::user::::::::::::::::: */
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
route.post('/negocio/create',/* [Auth, AccessRoleControl.isAdmin], */ Negocio.createNegocio );


route.get('/negocio/detail/idnegocio=:idnegocio', Negocio.showNegocioId)
    // update data negocio 
route.put('/negocio/update',[Auth, AccessRoleControl.isAdmin], Negocio.updateDataNegocio);
    // dar de baja un negocio
route.delete('/negocio/delete',[Auth, AccessRoleControl.isAdmin], Negocio.deleteNegocio);
     // control de pagos del servicio
route.get('/negocio/payment/control/show/idnegocio=:idnegocio', PaymentConrtol.checkPaymentControl)

// :::::::::::::ESTADO FINANCIERO::::::::::::::::::::
route.post('/financiero/state', EstadoFinanciero.createEstadoFinanciero);
route.get('/financiero/ventas/:idNegocio', EstadoFinanciero.getListVentas);
route.get('/financiero/gastos/:idNegocio', EstadoFinanciero.getListGastos);


// ::::::::::::::::::::VENTAS:::::::::::::::::::::::::::::::
route.post('/venta/create/:idNegocio/:idUser', Ventas.addNewVenta);
route.post('/venta/list', Ventas.getVentas);

// :::::::::::::::::::PRODUCTS:::::::::::::::::::::::::::::::
route.post('/products/add/:idNegocio/:idUser', Products.addNewProduct);
route.get('/products/get/list/:idNegocio', Products.getAllProducts);
route.put('/products/update/:idProducto', Products.updateProducto);

/* =======================salas=============================== */
route.post('/salas/create/:idUser', SalasRoutes.create);
route.get('/salas/list', SalasRoutes.list);

/* =======================Mesas=============================== */
route.post('/mesas/create/:idSala', Mesa.create);
route.get('/mesas/list/:idSala', Mesa.list);

/* =======================Producto=============================== */
route.post('/menu/create/:idUser', Menu.create);
route.get('/menu/list', Menu.list);
route.put('/menu/update/:idMenu', Menu.updateMenuDatas);

//registrar las imagenes
route.post('/image/product/:idmenu', uploadFileFotoProducto);


/* =======================Clientes=============================== */
route.post('/cliente/create/:idUser/:idNegocio?', Clientes.create);
route.get('/cliente/list', Clientes.list);
route.put('/cliente/update/:idCliente', Clientes.update);
route.post('/cliente/buscar',Clientes.searchCliente);

/* gastos y tipo de gastos */
route.post('/gastos/createTipoGastos', Gastos.createTipoGastos);
route.get('/gastos/listTipoGastos/:idNegocio?', Gastos.listTipoGastos);
route.get('/gastos/gastosTipos/:idTipoGastos', Gastos.listGastosTipo);
route.put('/gastos/updateTipoGastos/:idTipoGasto',Gastos.updateTipoGasto);

/* gastos user */
route.post('/userGastos/createUserGastos/:idUser', Gastos.createGastosUser);
route.get('/userGastos/listUserGastos/:idUser', Gastos.listGastosUser);
route.put('/userGastos/updateGastosUser/:idGastoUser/:idUser', Gastos.updateGastoUser);







module.exports = route;
