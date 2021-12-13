'use strict';

const EstadoFinanciero = require('../../../../../database/collection/models/estadoFinanciero');
const Negocio = require('../../../../../database/collection/models/negocio');

const buscarEstadoFinancieroVigente = async( idNegocio) => {
    
    const Data=[];

    try{
        const dataNegocio = await Negocio.negocio.findById({_id: idNegocio});
        const dataEstadoFinancier = await EstadoFinanciero.estadoFinanciero.findOne({idNegocio:dataNegocio._id, state:true});  
        console.log("eatados financiero\n",dataEstadoFinancier);
        if(dataEstadoFinancier){
            await Data.push(dataEstadoFinancier);
            return Data;
        }

        console.log("data --------");
        console.log(Data);
        if(dataNegocio && !dataEstadoFinancier){
            var newData =await crearEstadoFinanciero(dataNegocio);
            Data = await Data.push(newData);
        }
        return Data;
    }
    catch(error){
        return Data;
    }
}

// si no hay un estado finaciero activo se crea uno
const crearEstadoFinanciero = async ( dataNegocio )=>{
    console.log(dataNegocio)
    try{
        var NewEstadoFinaciero = new EstadoFinanciero.estadoFinanciero({
            idNegocio : dataNegocio._id,
            montoInicial : 300.90,
            montoCierreCaja : 89.89,
            montoActualDisponble: 0.00,
            montoActualUtilizado: 0.00,
            cierreDeCaja:{
                description:'',
                conformiadCajero:false,
                conformidadAdministrador:false,
            }
        })
    
        var DataCreated = await  NewEstadoFinaciero.save();
        console.log("creatted",DataCreated);
        return DataCreated;
    }
    catch(error){
        console.log("error al crear estado financiero\n",error);
    }
}




module.exports = {
    buscarEstadoFinancieroVigente,
}