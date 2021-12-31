'user strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// esatdo financiero del negocio
const estadoFinaciero = new Schema({
    idNegocio : String,
    montoInicial : Number,
    montoCierreCaja : Number,
    montoActualDisponble: Number,
    montoTotal:Number,
    montoActualUtilizado: Number,
    dateCreated:{ type: Date, default: Date.now },
    cierreDeCaja:{
        detalle:String,
        conformiadCajero:Boolean,
        conformidadAdministrador:Boolean,
        fechaInicio: {
            type: Date,
            default: Date.now
        },
        fechaCierre:Date,

    },
    listVentas:[{
        ref: 'Venta',
        type: Schema.Types.ObjectId
    }],
    state:{type:Boolean, default:true}

});






var estadoF = mongoose.model('estadofinanciero', estadoFinaciero);


module.exports = {
    estadoFinanciero : estadoF,
}