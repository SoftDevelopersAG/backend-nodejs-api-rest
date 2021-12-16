'use strict';

const mongoose = rquire('mongoose');
const Schema = mongoose.Schema;


const gastoSchema = new Schema({
    idNegocio: String,
    precioTotal: Number,
    products:[],
    state:Boolean,
    tipoDeGasto:{
        type:String,
        emun:['efectivo','tarjeta','deposito','transferencia'],
        default:'efectivo'
    },
    notaGasto:[{
        ref: 'NotaVenta',
        type: Schema.Types.ObjectId
    }]

});

var gasto = mongoose.model('gasto', gastoSchema);

module.exports = {
    gasto
}

