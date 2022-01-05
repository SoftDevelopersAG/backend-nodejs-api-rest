'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TIPOS_POGO = ['efectivo', 'tarjeta', 'transferencia', 'deposito'];


const VentaSchema = new Schema({
    idNegocio: String,
    idUser:String,
    idCLiente:String,
    nit: String,
    venta: Number,
    precioTotal: Number,
    precioTotalBackend: Number,
    pagoCliente:String,
    cambioCliente:String,
    products:[{
        ref: 'pvendido',
        type: Schema.Types.ObjectId
    }],
    state: {
        type:String,
        enum:['pendiente','preparado','entregado','Cancelado'],
        default:'Cancelado'
    },
    tipoDePago:{
        type:String,
        emun:TIPOS_POGO,
        default:'efectivo'
    },

    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },

});


// const SchemaNotaVenta = new Schema({
//     idVenta: String,
//     precioTotal: Number,
//     listProducts:Array,
//     tipoDePago: {
//         type: String,
//         enum: TIPOS_POGO,
//         default: 'efectivo'
//     },
//     description:String,
    

// });


const pVenta= new Schema({
    idNegocio: String,
    idProduct: String,

    /* idVenta:String, */

    nameProduct: String,
    category:String,
    subcategory:String,     //ref. utilsProducts > CategoriasSubcategorias 

    unidadesVendidos:Number, 
    precioUnitario: Number,  //Precio de venta
    precioCosto:Number,
    total:Number, // precio unitario * cantidad

    colorsAvailable:String, 
    envioDesde:String,
    costoEnvio:Number,
    estadoProduct:String,
    detalleVenta:String,   // detalle adicional del cliente.
    urlImages :Array,
    state: {
        type:Boolean,
        enum:[true, false],
        default:true
    },
    fechaRegistro: {type: Date, default: Date.now},
    fechaUpdate: {type: Date, default: Date.now},
})




var Venta = mongoose.model('Venta', VentaSchema);
// var notaVenta = mongoose.model('NotaVenta', SchemaNotaVenta);
var pvendido = mongoose.model('pvendido', pVenta);

module.exports = {
    Venta,
    // notaVenta,
    pvendido
}