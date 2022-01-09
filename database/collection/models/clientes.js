'use strict'
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Cliente = new Schema({
    idUser:String,
    idNegocio:String,   // No implementado
    name:String,
    lastName:String,
    ci:String,
    country:String,  //pais
    city:String,    //ciudad
    phoneNumber:Number,
    callingCode:Number,  //codigo de pais (eg: +591)
    homeAddress:String,  //direccion de casa
    description:String,
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },
});

var cliente = mongoose.model('cliente', Cliente);

module.exports = {
    cliente
}