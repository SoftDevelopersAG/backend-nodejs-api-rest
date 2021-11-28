'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Orden  = new Schema({
    idCliente    : String,
    idRestaurant : String,
    idmenu       : String,
    lugarEnvio   : Object,
    cantidad     : Number,
    pagoTotal    : Number,
    precio       : Number,
    stateSaldo   : { type: String, emun:['sincancelar','cancelado'], default:'sincancelar'},
    stateOrden   : { type:String, emun:['espera', 'proceso', 'enviado'], default:'espera' },
    dateOrder    : { type: Date, default:Date.now}

});


var orden = mongoose.model('order', Orden);
 


module.exports={
    orden
}