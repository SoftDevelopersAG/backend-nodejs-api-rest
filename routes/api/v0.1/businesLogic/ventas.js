'use strict';

const VentaSchema = require('../../../../database/collection/models/venta');
const { verificacionCamposRequeridos } = require('../../../../Utils/verifyCampos/verifyCampos');
const { verifyListProducts, comprovacionDeProductosInDB, createVenta } = require('./utilsVentas/utils');

class Ventas{

    static async addNewVenta(req, res, next){

        const { idNegocio, products, precioTotal } = await req.body;

        if(products.length === 0 || products === undefined || products === null) return res.status(400).send({error:"error", message:"No se ha enviado ningun producto"});
        var verifyCamposReq = await verificacionCamposRequeridos([idNegocio]);
        if(!verifyCamposReq) return res.status(400).send({error:"venta no procesada", message:"Complete los campos requiridos"});
        
        var stateVerify = await verifyListProducts(res, products);
        if(!stateVerify) return res.status(400).send({error:"venta no procesada", message:"Comple los campos requeridos los productos"});

        var stateExistProducts = await comprovacionDeProductosInDB(res, products);
        if(!stateExistProducts) return res.status(400).send({error:"venta no procesada", message:"el id de uno de los productos es incorrecto"});

        createVenta(res, products, idNegocio, precioTotal);


    }



    static async getVentas(req, res, next){
        try{
            const { idNegocio } = req.body;
            const ventas = await VentaSchema.Venta.find({idNegocio: idNegocio});
            res.status(200).send({status:"ok",message:"lista de ventas", result:ventas});
        }
        catch(err){
            console.log('error en utilsVentas', err);
            res.status(500).send({error:"error en el servidor"});
        }
    }
}


module.exports = Ventas;