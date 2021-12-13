'user strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// esatdo financiero del negocio
const estadoFinaciero = new Schema({
    idNegocio : String,
    montoInicial : Number,
    montoCierreCaja : Number,
    montoActualDisponble: Number,
    montoActualUtilizado: Number,
    dateCreated:{ type: Date, default: Date.now },
    cierreDeCaja:{
        description:String,
        conformiadCajero:Boolean,
        conformidadAdministrador:Boolean,
    },
    state:{type:Boolean, default:true}

});






var estadoF = mongoose.model('estadofinanciero', estadoFinaciero);


module.exports = {
    estadoFinanciero : estadoF,
}