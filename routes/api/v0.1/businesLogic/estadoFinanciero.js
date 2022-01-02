'use strict';
const estadoFinancieroSchema = require("../../../../database/collection/models/estadoFinanciero");
const UtilsEstadoFinancier = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const ventaSchema = require('../../../../database/collection/models/venta');
const utilsEstadoFinanciero = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const gastoUsuarioSchema = require('../../../../database/collection/models/gastosUser')



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

                
                await utilsEstadoFinanciero.buscarEstadoFinancieroVigente(idNegocio);

                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({idNegocio : idNegocio, state: true});
                console.log('===================================================');
                console.log(dataEstadoFinanciero);
                console.log(dataVenta, ' dataVenta *****');

                console.log('===================================================');

                var auxSuma = await dataEstadoFinanciero.montoActualDisponble + dataVenta.precioTotalBackend;
                var listVentas = await [...dataEstadoFinanciero.listVentas,dataVenta._id];
                await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({_id: dataEstadoFinanciero._id}, {montoActualDisponble: auxSuma,  listVentas});
                break;
            }
            case "gasto":{
                
            }
            default:{
                console.log("tipo de operacion no valida")
            }
        }
    }


    static async updateEstadoFinancieroGasto(idNegocio, idGastoUser, StringTipoDeOperacion){

        switch(StringTipoDeOperacion){
            case "gasto":{
                var dataGasto  = await gastoUsuarioSchema.gastosUser.findById({_id: idGastoUser});
                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({idNegocio : idNegocio, state: true});
                
                if(dataEstadoFinanciero.montoActualDisponble>=dataGasto.montoGasto){

                    var auxSuma = await dataEstadoFinanciero.montoActualUtilizado + dataGasto.montoGasto;
                    var auxSaldofoActual = await dataEstadoFinanciero.montoActualDisponble - dataGasto.montoGasto;
                    var listGastos = await [...dataEstadoFinanciero.listGastos,dataGasto._id];
                    await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({_id: dataEstadoFinanciero._id}, {montoActualDisponble: auxSaldofoActual, montoActualUtilizado: auxSuma, listGastos});
                }
                if(dataEstadoFinanciero.montoActualDisponble < dataGasto.montoGasto){
                    console.log(`tipos de transacion no validos, in updateEstadoFinancieroGasto()`,);
                }
    
                console.log(auxSaldofoActual, dataEstadoFinanciero.montoActualDisponble, dataGasto.montoGasto);
                break;
            }

            default:{
                console.log("tipo de operacion no valida, in updateEstadoFinancieroGasto()");
            }
        }
    }


    static async getEstateFinanciero(idNegocio){
        try{
            var estadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({idNegocio : idNegocio, state: true});
            if(estadoFinanciero){
                // var dataSaldoAdual = await dataEstadoFinancier.montoActualDisponble - dataEstadoFinancier.montoActualUtilizado;
                return estadoFinanciero;
            }
            if(!estadoFinanciero){
                return {status:"No fount", message:"no se encontro el estado financiero"}
            }
        }
        catch(error){
            return {status:"No fount", message:"no se encontro el estado financiero"}
        }

    }

    static async getListVentas(req, res){

        const { idNegocio } = req.params;
        
        const dataLisVentas = await utilsEstadoFinanciero.getVentas(idNegocio)
        if(dataLisVentas.status=='No fount')return res.status(404).send({status:"error", message:"no se encontro la lista de ventas", datosRequerido:[{nameParams: "idNegocio", type:"objeciD"}]});

        res.status(200).send({status:"ok", message:"show list ventas", result:dataLisVentas.listVentas});
    }


    static async getListGastos(req, res){
        var { idNegocio } = req.params;
        
        const dataListGastos = await utilsEstadoFinanciero.getGastos(idNegocio)
        if(dataListGastos.status=='No fount')return res.status(404).send({status:"error", message:"no se encontro la lista de los gastos", datosRequerido:[{nameParams: "idNegocio", type:"objeciD"}]});

        res.status(200).send({status:"ok", message:"show list gastos", result:dataListGastos.listGastos});
    }

}

module.exports = EstadoFinanciero;