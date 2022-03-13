'use strict'

const types = require('../types/type');


// controla el tipo de acciones que emite socket.io
const socketControllers = ( action, data={} ) =>{

    switch(action){
        case types.addNewUser:{
            
            console.log(data)
            io.emit(types.addNewUser, data);
            break;
        }
        case types.addNewProduct:{
        
            io.emit(types.addNewProduct, data);
            break;
        }
        case types.changeStateTickets:{
            io.emit(types.changeStateTickets, data);
            break;
        }

        default:{
            console.log('no se encontro el tipo de accion')
            console.log(action)
            console.log(types)
        }
    }
}



module.exports = socketControllers;