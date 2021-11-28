'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ControlUsage = new Schema({
    idTienda    : String,
    nameTienda  : String,
    nameOwner   : String,
    country     : String,
    phoneNumber : Number,
    callingCode : Number,
    state:{
        type:String, 
        enum:['active','pending','desabled','permanent'],
        default:'peding'
    },
    // paymentPlan: "2021/06/18 16:17:30" --> plan de pago actual --> axample : new Date("2021/06/18 16:17:30")
    paymentPlan: String,

})

var usageControl = mongoose.model("Usagecontrol", ControlUsage);

module.exports = {
    usageControl
}