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
    listGastos:[{
        ref: 'gastosUser',
        type: Schema.Types.ObjectId
    }],
    state:{type:Boolean, default:true},
    dateCreated:{ type: Date, default: Date.now },
    updateDate:{ type: Date, default: Date.now }

});






var estadoF = mongoose.model('estadofinanciero', estadoFinaciero);


module.exports = {
    estadoFinanciero : estadoF,
}