'use strict';
const { estadoFinaniero }= require("../../../../database/collection/models/estadoFinanciero");
const Negocio = require('../../../../database/collection/models/negocio');

 class EstadoFinanciero {

    static async  createEstadoFinanciero (req, res, next) {
        
          var stateNecogio = Negocio.negocio.findById()
          

         console.log("createEstadoFinanciero");
         res.status(200).send({message:"show estado financiero"});
    }
}

module.exports = EstadoFinanciero;