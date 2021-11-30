'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Menu = new Schema({
    idRestaurant: String,
    nombre: String,
    precio: Number,
    descripcion: String,
    fotoProducto: String,
    fechaRegistro: {type: Date, default: Date.now},

})



var menu = mongoose.model('menu', Menu);


module.exports = {
    menu
}