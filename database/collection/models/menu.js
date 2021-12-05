'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Menu = new Schema({
    idRestaurant: String,
    idUser:String,
    name: String,
    price: Number,
    description: String,
    quantity:Number,
    typeProduct:String,
    fotoProduct: String,
    fechaRegistro: {type: Date, default: Date.now},

})



var menu = mongoose.model('menu', Menu);


module.exports = {
    menu
}