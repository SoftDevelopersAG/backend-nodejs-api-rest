'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// para los pedidos que se realizan en el restaurante
const Orden  = new Schema({
    idRestaurant : String,
    idmenu       : String,
    idMesa       : String,
    idCliente    : String,
    idMesero     : String,
    idCocinero   : String,
    lugarEnvio   : Object,
    cantidad     : Number,
    pagoTotal    : Number,
    precio       : Number,
    listProduct  : [/* {
        ref:'product',
        type:Schema.Types.ObjectId
    } */],
    stateSaldo   : { type: String, emun:['sincancelar','cancelado'], default:'sincancelar'},
    
    stateOrden   : { type:String, emun:['espera', 'proceso', 'enviado'], default:'espera' },
    
    
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now }

});


var orden = mongoose.model('order', Orden);
 


module.exports={
    orden
}