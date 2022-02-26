'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const galeriaStechema = new Schema({    
    idNegocio: String,
    idUser:String,
    name:String,
    price:String,
    description:String,
    type:String,
    img:String

});

var galeria = mongoose.model('galeria', galeriaStechema);

module.exports = {
    galeria
}
