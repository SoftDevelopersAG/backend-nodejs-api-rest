'use strict'
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TipoGastos = new Schema({
    idNegocio:String,
    name:String,
    description:String,
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },
    
});

var tipoGastos = mongoose.model('tipoGastos', TipoGastos);

module.exports = {
    tipoGastos
}