'use strict';
const estadoFinancieroSchema = require("../../../../database/collection/models/estadoFinanciero");
const UtilsEstadoFinancier = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const ventaSchema = require('../../../../database/collection/models/venta');
const utilsEstadoFinanciero = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const gastoUsuarioSchema = require('../../../../database/collection/models/gastosUser')
const {user} = require('../../../../database/collection/models/user');
const {negocio} = require('../../../../database/collection/models/negocio');

class EstadoFinanciero {

    static async createEstadoFinanciero(req, res, next) {
        var idNegocio = req.body.idNegocio;

        var dataStadoFinanciero = await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);

        console.log("createEstadoFinanciero");
        res.status(200).send({ status: "ok", message: "show estado financiero", result: dataStadoFinanciero });
    }



    // actualiza el estado financiero un negocio
    static async updateEstadoFinanciero(idNegocio, idVenta, intPrecioTotal, StringTipoDeOperacion) {

        switch (StringTipoDeOperacion) {
            case "venta": {
                var dataVenta = await ventaSchema.Venta.findById({ _id: idVenta });


                await utilsEstadoFinanciero.buscarEstadoFinancieroVigente(idNegocio);

                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio: idNegocio, state: true });
                /*  console.log('===================================================');
                 console.log(dataEstadoFinanciero);
                 console.log(dataVenta, ' dataVenta *****');
 
                 console.log('==================================================='); */

                var auxSuma = await dataEstadoFinanciero.montoActualDisponble + dataVenta.precioTotalBackend;
                var listVentas = await [...dataEstadoFinanciero.listVentas, dataVenta._id];
                await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id: dataEstadoFinanciero._id }, { montoActualDisponble: auxSuma, listVentas });
                break;
            }
            case "gasto": {

            }
            default: {
                console.log("tipo de operacion no valida")
            }
        }
    }


    static async updateEstadoFinancieroGasto(idNegocio, idGastoUser, StringTipoDeOperacion) {

        switch (StringTipoDeOperacion) {
            case "gasto": {
                var dataGasto = await gastoUsuarioSchema.gastosUser.findById({ _id: idGastoUser });
                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio: idNegocio, state: true });

                if (dataEstadoFinanciero.montoActualDisponble >= dataGasto.montoGasto) {

                    var auxSuma = await dataEstadoFinanciero.montoActualUtilizado + dataGasto.montoGasto;
                    var auxSaldofoActual = await dataEstadoFinanciero.montoActualDisponble - dataGasto.montoGasto;
                    var listGastos = await [...dataEstadoFinanciero.listGastos, dataGasto._id];
                    await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id: dataEstadoFinanciero._id }, { montoActualDisponble: auxSaldofoActual, montoActualUtilizado: auxSuma, listGastos });
                }
                if (dataEstadoFinanciero.montoActualDisponble < dataGasto.montoGasto) {
                    console.log(`tipos de transacion no validos, in updateEstadoFinancieroGasto()`,);
                }

                console.log(auxSaldofoActual, dataEstadoFinanciero.montoActualDisponble, dataGasto.montoGasto);
                break;
            }

            default: {
                console.log("tipo de operacion no valida, in updateEstadoFinancieroGasto()");
            }
        }
    }


    static async getEstateFinanciero(idNegocio) {
        try {
            var estadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio: idNegocio, state: true });
            if (estadoFinanciero) {
                // var dataSaldoAdual = await dataEstadoFinancier.montoActualDisponble - dataEstadoFinancier.montoActualUtilizado;
                return estadoFinanciero;
            }
            if (!estadoFinanciero) {
                return { status: "No fount", message: "no se encontro el estado financiero" }
            }
        }
        catch (error) {
            return { status: "No fount", message: "no se encontro el estado financiero" }
        }

    }

    static async getListVentas(req, res) {

        const { idNegocio } = req.params;

        const dataLisVentas = await utilsEstadoFinanciero.getVentas(idNegocio)
        if (dataLisVentas.status == 'No fount') return res.status(404).send({ status: "error", message: "no se encontro la lista de ventas", datosRequerido: [{ nameParams: "idNegocio", type: "objeciD" }] });

        res.status(200).send({ status: "ok", message: "show list ventas", result: dataLisVentas.listVentas });
    }


    static async getListGastos(req, res) {
        var { idNegocio } = req.params;

        const dataListGastos = await utilsEstadoFinanciero.getGastos(idNegocio)
        if (dataListGastos.status == 'No fount') return res.status(404).send({ status: "error", message: "no se encontro la lista de los gastos", datosRequerido: [{ nameParams: "idNegocio", type: "objeciD" }] });

        res.status(200).send({ status: "ok", message: "show list gastos", result: dataListGastos.listGastos });
    }

    static async cierreCaja(req, res) {
        const { idNegocio,idUser } = req.params;
        const { conformiadCajero, detalle, conformidadAdministrador, idCajero } = req.body;

        const verifyDatas = await validateDatas(conformiadCajero, detalle, conformidadAdministrador, idCajero);
        if(verifyDatas.status == 'No fount') return res.status(206).json(verifyDatas);

        const verifyEstadoFinanciero = await validateEstadoFinanciero(idNegocio);
        if(verifyEstadoFinanciero.status == 'No fount') return res.status(206).json(verifyEstadoFinanciero);

        const isAdmin = await validateUserIsAdmin(idUser);
        if(isAdmin.status == 'No fount') return res.status(206).json(isAdmin)
        const verifyNegocio = await validateNegocio(idNegocio);
        if(verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio)
        const isCaja = await validateUserIsCajero(idCajero);
        if(isCaja.status == 'No fount') return res.status(206).json(isCaja)

        const updateCierreCaja = await {
            detalle: detalle || 'No hay detalle',
            conformiadCajero: conformiadCajero,
            conformidadAdministrador: conformidadAdministrador,
            fechaCierre: Date.now(),
            fechaInicio:verifyEstadoFinanciero.result.dateCreated,
            idAdmin: idUser,
            idCajero: idCajero
        }
        try {            
            await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id:verifyEstadoFinanciero.result._id }, { state: false, cierreDeCaja: updateCierreCaja });
            const resp = await estadoFinancieroSchema.estadoFinanciero.findById({_id:verifyEstadoFinanciero.result._id})
            const dataStadoFinanciero = await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
            return res.status(200).json({
                status:'ok', message: 'se actualizo el estado financiero',result:resp,nuevoEstadoFinanciero:dataStadoFinanciero
            })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }

}
//validamos los datos requiridos
 async function validateDatas (conformiadCajero, detalle, conformidadAdministrador, idCajero){
    if(!conformiadCajero) return { status: 'No fount', message: 'Verifique si el cajero esta conforme'};
    if(!detalle) return { status: 'No fount', message: 'Detalle es obligatorio'};
    if(!conformidadAdministrador) return { status: 'No fount', message: 'No se esta mando la conformidad del usuario administrador'};
    if(!idCajero) return { status: 'No fount', message: 'Inserte nombre del cajero'};
    return {status:'ok',message:'continuar'}

 }
//verificamos si es admin
async function validateUserIsAdmin(idAdminUser){
    try {
        const resp = await user.findById({_id:idAdminUser}).populate('role');
        if(!resp) return {status: 'No fount', message: 'Ese usuario no existe'};
        let isAdmin = false
        for(var i = 0; i < resp.role.length; i++) {           
            if(resp.role[i].name == 'admin'){
                isAdmin = true;
            }
        }
        if(!isAdmin) return {status: 'No fount', message: 'Ese usuario no es admin'}
        return {status:'ok', message:'Ese usuario es admin'}
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'error 400', error}
    }
}
//verificamos si es cajero
async function validateUserIsCajero(isCajero){
    try {
        const resp = await user.findById({_id:isCajero}).populate('role');
        if(!resp) return {status: 'No fount', message: 'Ese usuario no existe'};
        let isAdmin = false       
        for(var i = 0; i < resp.role.length; i++) {            
            if(resp.role[i].name == 'caja'){
                isAdmin = true;
            }
        }
        if(!isAdmin) return {status: 'No fount', message: 'Ese usuario no es cajero'}
        return {status:'ok', message:'Ese usuario es cajero'}
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'error 400', error}
    }
}
//verificamos is el negocio existe
async function validateNegocio(idNegocio){    
    try {
        const resp = await negocio.findById({_id:idNegocio});
        if(!resp) return {status: 'No fount', message: 'Ese negocio no existe'};
        return {status:'ok', message:'Ese negocio existe'}
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'error 400', error}
    }
}

//verificamos si hay estado finaciero activo
async function validateEstadoFinanciero(idNegocio){
    try {
        const resp = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio, state: true });
        if(!resp) return {status: 'No fount', message:'No hay estado financiero activo'};
        return {status:'ok', message:'Estado financiero activo', result:resp}
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'error 400', error}
    }
}

module.exports = EstadoFinanciero;