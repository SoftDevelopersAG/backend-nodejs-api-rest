
'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrdenTemporal = new Schema({
     idMenu         : String,
     idClient       : String, 
     idRestaurant  : String,
     nameMenu      : String, 
     cantidad       : Number,
     precioUnitario : Number,
     fotoProducto : String,
     precio_cantidad_tocal : Number,
     stateOrdenClient     : { type : String, enum : ['aggregated', 'confirmed', 'rejected'], default : 'aggregated'},
     stateOrderRestaurante : { type: String, enum : ['espera', 'proceso', 'enviado'], default : 'espera'},
     dateOrderTempora :  { type: Date, default: Date.now },

});


var orderTemporal  = mongoose.model('ordertemporal', OrdenTemporal);



module.exports = {
     orderTemporal
}
