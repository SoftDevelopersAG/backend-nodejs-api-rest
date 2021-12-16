'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    idNegocio: String,
    nameTienda:String,
    nameProduct: String,
    category:String,
    subcategory:String,     //ref. utilsProducts > CategoriasSubcategorias 
    state:{
        type:Boolean,
        enum:[true, false],
        default:true
    },
    unidadesDiponibles:Number, 
    cantidadComprada:Number,
    precioUnitario: Number,  //Precio de venta
    precioCosto: Number,   //precio cost de adquisicion
    
    colorsAvailable:{type:String, enum:[
        "color de la foto",
        "amarillo",
        "ambar",
        "anil o indigo",
        "azul",
        "azul claro",
        "azul eléctrico",
        "azul marino",
        "beis",
        "bermellon",
        "blanco",
        "blanco marfil",
        "burdeos",
        "cafe",
        "caoba o rojo indio ",
        "caqui  ",
        "carmesi ",
        "castano",
        "celeste",
        "cereza",
        "champan",
        "chartreuse o cartujo",
        "cian",
        "cobre",
        "color terracota o teja",
        "coral",
        "crema",
        "fucsia",
        "granate",
        "gris",
        "gris perla",
        "gris zinc",
        "gualdo",
        "hueso",
        "lavanda",
        "lila",
        "magenta",
        "marron",
        "marron chocolate",
        "morado",
        "naranja",
        "negro",
        "ocre",
        "ocre claro",
        "ocre oscuro",
        "oro o dorado",
        "pardo",
        "plata",
        "plomo",
        "purpura",
        "rojo",
        "rojo carmin",
        "rojo oxido",
        "rosa",
        "rosa palo",
        "salmon",
        "turquesa",
        "verde",
        "verde botella",
        "verde esmeralda",
        "verde lima",
        "verde manzana",
        "verde musgo",
        "verde oliva",
        "verde pistacho",
        "verdeagua o aguamarina",
        "violeta",
        "vino"
    ], 
    default:"color de la foto"},
    envioDesde:String,
    tipoEnvio:{
        type:String, enum:[
            "gratuito",
            "con costo",
        ],
        default:"gratuito"
    },
    costoEnvio:Number,
    estadoProduct:{
        type:String, enum:[
            "nuevo",
            "usado",
            "caja abierta",
        ],
        default:"nuevo"
    },
    marcaproduct:String,
    urlImages= Array,
    fechaRegistro: {type: Date, default: Date.now},
})



var product = mongoose.model('producto', Product);


module.exports = {
    product
}