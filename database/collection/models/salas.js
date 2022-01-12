'use strict'
const mongoose = require('mongoose');
const {Schema} = mongoose;

const Salas = new Schema({
    nameSala       : String,
    numberMesas    : Number,
    numberClientes : Number,
    idUser         : String,
    idNegocio         : String,
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },
});

const salas = mongoose.model('salas',Salas);
module.exports={
    salas
}
