'use strict'
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GastosUser = new Schema({
    idTipoGastos:String,
    description:String,
    idUser:String,
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