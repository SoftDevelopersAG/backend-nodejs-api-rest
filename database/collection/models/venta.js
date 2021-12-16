'use strict';

const mongoose = rquire('mongoose');
const Schema = mongoose.Schema;

const TIPOS_POGO = ['efectivo', 'tarjeta', 'transferencia', 'deposito'];

const VentaSchema = new Schema({
    idNegocio: String,
    precioTotal: Number,
    products:[],
    state:{
        type:String,
        enum:['pendiente','preparado','entregado','Cancelado'],
        default:'pendiente'
    },
    tipoDePago:{
        type:String,
        emun:['efectivo','tarjeta','deposito','transferencia'],
        default:'efectivo'
    },
    notaVenta:[{
        ref: 'NotaVenta',
        type: Schema.Types.ObjectId
    }]

});


const NotaVenta = new Schema({
    idVenta: String,
    precioTotal: Number,
    listProducts:Array,
    tipoDePago: {
        type: String,
        enum: TIPOS_POGO,
        default: 'efectivo'
    },
    description:String,
    

});


var Venta = mongoose.model('Venta', VentaSchema);
var NotaVenta = mongoose.model('NotaVenta', NotaVentaSchema);

module.exports = {
    Venta,
    NotaVenta
}