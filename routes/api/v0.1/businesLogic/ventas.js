'use strict';

const VentaSchema = require('../../../../database/collection/models/venta');
const { verificacionCamposRequeridos } = require('../../../../Utils/verifyCampos/verifyCampos');
const { verifyListProducts, comprovacionDeProductosInDB, createVenta, validateUser, validateCliente } = require('./utilsVentas/utils');

class Ventas {

    static async addNewVenta(req, res, next) {

        const {idCliente, products, precioTotal, nombreCliente,pagoCliente,cambioCliente } = await req.body;
        const { idUser, idNegocio } = req.params;
        let cliente = ''

        const verifyUser = await validateUser(idUser);
        if (verifyUser.status == 'No fount') return res.status(206).json(verifyUser);
        if (idCliente) {
            const verifyCliente = await validateCliente(idCliente);
            if (verifyCliente.status == 'No fount') return res.status(206).json(verifyCliente);
            cliente = idCliente;
        } else {
            cliente = nombreCliente
        }
        if(pagoCliente < precioTotal){
            return res.status(206).json({status: 'No fount',message: 'El pago del cliente es menor al cambio'})
        }

        var verifyCamposReq = await verificacionCamposRequeridos([idNegocio]);
        /* console.log('===================================================================');
        console.log(verifyCamposReq, 'verifyCamposReq')
        console.log('==================================================================='); */

        if (!verifyCamposReq) return res.status(206).send({status: 'No fount', error: "venta no procesada", message: "Complete los campos requiridos" });

        var stateVerify = await verifyListProducts(res, products);
        console.log('===================================================================>>>');
        console.log(stateVerify, 'stateVerify')
        console.log('===================================================================>>>>');
        if (!stateVerify) return res.status(206).send({status: 'No fount', error: "venta no procesada", message: "Comple los campos requeridos los productos" });

        var stateExistProducts = await comprovacionDeProductosInDB(res, products);
       /*  console.log('===================================================================');
        console.log(stateExistProducts, 'stateExistProducts')
        console.log('==================================================================='); */
        if (!stateExistProducts) return res.status(206).send({status: 'No fount', error: "venta no procesada", message: "el id de uno de los productos es incorrecto" });

        createVenta(res, products, idNegocio, precioTotal, cliente, idUser,pagoCliente,cambioCliente);
    }



    static async getVentas(req, res, next) {
        try {
            const { idNegocio } = req.body;
            const ventas = await VentaSchema.Venta.find({ idNegocio: idNegocio });
            res.status(200).send({ status: "ok", message: "lista de ventas", result: ventas });
        }
        catch (err) {
            console.log('error en utilsVentas', err);
            res.status(500).send({ error: "error en el servidor" });
        }
    }
}


module.exports = Ventas;