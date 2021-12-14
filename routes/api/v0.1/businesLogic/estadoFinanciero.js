'use strict';
const { estadoFinanciero }= require("../../../../database/collection/models/estadoFinanciero");
const Negocio = require('../../../../database/collection/models/negocio');
const UtilsEstadoFinancier = require('./utilsEstadFinanciero/utilsEstadoFinanciero');

 class EstadoFinanciero {

    static async  createEstadoFinanciero (req, res, next) {
          var idNegocio = req.body.idNegocio;

     
          var dataStadoFinanciero = await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
       
          

         console.log("createEstadoFinanciero");
         res.status(200).send({status:"ok", message:"show estado financiero", result:dataStadoFinanciero});
    }
}

module.exports = EstadoFinanciero;