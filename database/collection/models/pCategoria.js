'use strict'

const monogoose = require('mongoose');
const Schema = monogoose.Schema;

const pCategoriaSchema = new Schema({

    idNegocio:String,
    idUser:String,
    nombre:String,
    subcategorias:[{type:Schema.Types.ObjectId, ref:'pSubcategoria'}],
    // fechaRegistro:{type:Date, default: Date.now},
    // dateUpdate:{type:Date, default: Date.now}

},{timestamps:true});



const pSubcategoriaSchema = new Schema({
    idPCategoria:String,
    idUser:String,
    nombre:String,
    fechaRegistro:{type:Date, default: Date.now},
    dateUpdate:{type:Date, default: Date.now}
})


var pCategoria = monogoose.model('pCategoria',pCategoriaSchema);
var pSubcategoria = monogoose.model('pSubcategoria',pSubcategoriaSchema);



module.exports= {
    pCategoria,
    pSubcategoria
}