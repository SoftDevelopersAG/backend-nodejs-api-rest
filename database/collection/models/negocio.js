'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Negocio = new Schema({
    nombre:String,
    slug:String,
    nit: String,
    idClient:String,
    propietario: String,
    address: String,
    phoneNumber: Number,
    callingCodes: Number,
    country:Object,
    city: String,
    description: String,
    category:String,
    subcategory:String,
    flagCountry:String,
    state:{
        type:String,
        enum:[
            'active',
            'pending',  
            'invalid',
            'deleted',
            'trialPeriod'
        ],
        default: 'trialPeriod'
    },
    log: Number, 
    lat: Number, 
    urlLogo: String,
    urlFotoLugar:String,
    fechaDeRegistro: {type: Date, default: Date.now()}
})




var negocio = mongoose.model('negocios',Negocio);


module.exports = {
    negocio
}