'use strict'
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Cliente = new Schema({
    idUser:String,
    name:String,
    lastName:String,
    ci:String,
    phoneNumber:Number,
    description:String,
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },
});

var cliente = mongoose.model('cliente', Cliente);

module.exports = {
    cliente
}