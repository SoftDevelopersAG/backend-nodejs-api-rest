'use strict';
const estadoFinancieroSchema = require("../../../../database/collection/models/estadoFinanciero");
const Negocio = require('../../../../database/collection/models/negocio');
const UtilsEstadoFinancier = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const ventaSchema = require('../../../../database/collection/models/venta');

 class EstadoFinanciero {

    static async  createEstadoFinanciero (req, res, next) {
          var idNegocio = req.body.idNegocio;

          var dataStadoFinanciero = await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
       
         console.log("createEstadoFinanciero");
         res.status(200).send({status:"ok", message:"show estado financiero", result:dataStadoFinanciero});
    }



    // actualiza el estado financiero un negocio
    static async updateEstadoFinanciero (idNegocio, idVenta, intPrecioTotal, StringTipoDeOperacion ) {

        switch(StringTipoDeOperacion){
            case "venta":{
                var dataVenta  = await ventaSchema.Venta.findById({_id: idVenta});
                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({idNegocio : idNegocio, state: true});
                console.log(dataEstadoFinanciero);
                var auxSuma = await dataEstadoFinanciero.montoActualDisponble + dataVenta.precioTotalBackend;
                await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({_id: dataEstadoFinanciero._id}, {montoActualDisponble: auxSuma});
                break;
            }
            case "compra":{

            }
            default:{
                console.log("tipo de operacion no valida")
            }
        }
    }



}

module.exports = EstadoFinanciero;