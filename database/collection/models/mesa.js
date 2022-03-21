'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

const Mesa = new Schema({
    name:String,
    numberChair:Number,
    numberClinetes:Number,
    idSala:String,
    state  : {type: Boolean,default:false},
    dateCreate : { type : Date, default : Date.now },
    updateDate : { type : Date, default : Date.now },
});

var mesa = mongoose.model('mesas', Mesa);

module.exports = {
    mesa
}