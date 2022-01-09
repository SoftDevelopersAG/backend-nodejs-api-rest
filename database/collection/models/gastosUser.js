'use strict'
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GastosUser = new Schema({
    idTipoGastos:String,
    idNegocio:String,   
    description:String,
    idUser:String,
    montoAsignadoA:String,   //nombre de la persona que se le asigna el gasto
    // ci:String,      
    montoGasto:Number,
    responsableUpdate:{
        type:String,
        default: 'none'
    },
    isUpdate:{
        type:Boolean,
        default: false
    },
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },
});

var gastosUser = mongoose.model('gastosUser', GastosUser);

module.exports = {
    gastosUser
}