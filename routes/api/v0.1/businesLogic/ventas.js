'use strict';

const VentaSchema = require('../../../../database/collection/models/venta');
const { verificacionCamposRequeridos } = require('../../../../Utils/verifyCampos/verifyCampos');
const { verifyListProducts, comprovacionDeProductosInDB, createVenta, validateUser, validateCliente } = require('./utilsVentas/utils');
const { user } = require('../../../../database/collection/models/user')
const { cliente } = require('../../../../database/collection/models/clientes');
class Ventas {

    static async addNewVenta(req, res, next) {

        const { idCliente, products, precioTotal, nombreCliente, pagoCliente, cambioCliente } = await req.body;
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
        if (pagoCliente < precioTotal) {
            return res.status(206).json({ status: 'No fount', message: 'El pago del cliente es menor al cambio' })
        }

        if (products.length === 0 || products === undefined || products === null) return res.status(400).send({ error: "error", message: "No se ha enviado ningun producto" });
        var verifyCamposReq = await verificacionCamposRequeridos([idNegocio]);
        /* console.log('===================================================================');
        console.log(verifyCamposReq, 'verifyCamposReq')
        console.log('==================================================================='); */

        if (!verifyCamposReq) return res.status(206).send({ status: 'No fount', error: "venta no procesada", message: "Complete los campos requiridos" });

        var stateVerify = await verifyListProducts(res, products);
        if (stateVerify.status === 'No fount') return res.status(206).send({ status: 'No fount', error: "venta no procesada", message: stateVerify });

        var stateExistProducts = await comprovacionDeProductosInDB(res, products);
        /*  console.log('===================================================================');
         console.log(stateExistProducts, 'stateExistProducts')
         console.log('==================================================================='); */
        if (!stateExistProducts) return res.status(206).send({ status: 'No fount', error: "venta no procesada", message: "el id de uno de los productos es incorrecto" });

        createVenta(res, products, idNegocio, precioTotal, cliente, idUser, pagoCliente, cambioCliente);
    }



    static async getVentas(req, res, next) {
        try {
            const { idNegocio } = req.body;
            const ventas = await VentaSchema.Venta.find({ idNegocio });
            res.status(200).send({ status: "ok", message: "lista de ventas", result: ventas });
        }
        catch (err) {
            console.log('error en utilsVentas', err);
            res.status(400).send({ status: 'No fount', error: "error en el servidor", err });
        }
    }
    //listando ventas del usuario del dia
    static async getListVentasUser(req, res) {
        try {
            const { idNegocio, idUser } = req.params;

            const now = new Date();
            const dia = now.toString().split(' ')[0];
            const mes = now.toString().split(' ')[1];
            const num = now.toString().split(' ')[2];
            const anio = now.toString().split(' ')[3];

            const userName = await getNameUser(idUser);
            if (userName.status == 'No fount') return res.status(404).json({
                status: 'No fount', message: 'Ese usuario no existe'
            });
            const ventas = await VentaSchema.Venta.find({ idNegocio, idUser }, {
                _id: 1,
                idUser: 1,
                idCLiente: 1,
                venta: 1,
                precioTotal: 1,
                pagoCliente: 1,
                cambioCliente: 1,
                products: 1,
                state: 1,
                dateCreate: 1
            }).populate('products');
            const filter = await ventas.filter((data) => {
                return data.dateCreate?.toString().includes(`${dia} ${mes} ${num} ${anio}`)
            })
            let arr = [], err = false, total = 0, sumEfectivoTotal = 0, sumCambio = 0;
            for (let i = 0; i < filter.length; i++) {
                total = filter[i].precioTotal + total;
                sumEfectivoTotal = (filter[i].pagoCliente * 1) + sumEfectivoTotal;
                sumCambio = (filter[i].cambioCliente * 1) + sumCambio;

                const user = await getNameUser(filter[i].idUser);
                if (user.status == 'No fount') return err = true;

                const cliente = await getNameCliente(filter[i].idCLiente);
                if (cliente.status == 'No fount') return err = true
                arr.push({
                    _id: filter[i]._id,
                    idUser: `${user.resp.name} ${user.resp.lastName}`,
                    idCLiente: cliente.status == 'No' ? filter[i].idCLiente : `${cliente.resp.name} ${cliente.resp.lastName}`,
                    venta: filter[i].venta,
                    precioTotal: filter[i].precioTotal,
                    pagoCliente: filter[i].pagoCliente,
                    cambioCliente: filter[i].cambioCliente,
                    products: filter[i].products,
                    state: filter[i].state,
                    dateCreate: filter[i].dateCreate,
                    hora:filter[i].dateCreate?.toString().split(' ')[4],
                })
            }
            if (err == true) return res.status(206).json({ status: 'No fount', message: 'Error al mostrar los datos' });


            return res.status(200).send({
                status: "ok",
                message: `Lista de ventas de ${userName.resp.name} ${userName.resp.lastName}`,
                sumTotal: total,
                sumEfectivoTotal,
                sumCambio,
                fecha: `${dia} ${mes} ${num} ${anio}`,
                cantidadVentas:ventas.length,
                result: arr
            });
        }
        catch (err) {
            console.log('error en utilsVentas', err);
            return res.status(400).send({ status: 'No fount', error: "error en el servidor", err });
        }
    }
    //lista de todas las ventas por rangos
    static async getListVentasRange(req, res) {
        const { idNegocio,fechaInicio,fechaFinal } = req.params;
        try {
            const ventas = await VentaSchema.Venta.find({
                idNegocio, $and: [
                    { dateCreate: { $gte: new Date(`${fechaInicio}T00:00:14.000Z`) } },
                    { dateCreate: { $lte: new Date(`${fechaFinal}T23:59:59.999Z`) } }
                ]
            }, {
                _id: 1,
                idUser: 1,
                idCLiente: 1,
                venta: 1,
                precioTotal: 1,
                pagoCliente: 1,
                cambioCliente: 1,
                products: 1,
                state: 1,
                dateCreate: 1
            }).populate('products');

            let arr = [], err = false, total = 0, sumEfectivoTotal = 0, sumCambio = 0;
            for (let i = 0; i < ventas.length; i++) {
                total = ventas[i].precioTotal + total;
                sumEfectivoTotal = (ventas[i].pagoCliente * 1) + sumEfectivoTotal;
                sumCambio = (ventas[i].cambioCliente * 1) + sumCambio;

                const user = await getNameUser(ventas[i].idUser);
                if (user.status == 'No fount') return err = true;

                const cliente = await getNameCliente(ventas[i].idCLiente);
                if (cliente.status == 'No fount') return err = true
                arr.push({
                    _id: ventas[i]._id,
                    idUser: `${user.resp.name} ${user.resp.lastName}`,
                    idCLiente: cliente.status == 'No' ? ventas[i].idCLiente : `${cliente.resp.name} ${cliente.resp.lastName}`,
                    venta: ventas[i].venta,
                    precioTotal: ventas[i].precioTotal,
                    pagoCliente: ventas[i].pagoCliente,
                    cambioCliente: ventas[i].cambioCliente,
                    products: ventas[i].products,
                    state: ventas[i].state,
                    dateCreate: ventas[i].dateCreate,
                    hora:ventas[i].dateCreate?.toString().split(' ')[4], 
                })
            }

            return res.status(200).json({
                status:'ok',
                message:'Rango de fechas',
                sumTotal: total,
                sumEfectivoTotal,
                sumCambio,
                cantidadVentas:ventas.length,
                result:arr
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ status: 'No fount', error: "error en el servidor", err });
        }


    }

}

async function getNameUser(idUSer) {
    //console.log(idUSer, ' sdfsdfsdf_______')
    try {
        const resp = await user.findOne({ _id: idUSer })

        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' }
        return { status: 'ok', message: 'usuario si existe', resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'Ese usuario no existe' }
    }
}
async function getNameCliente(idCliente) {
    //console.log(idUSer, ' sdfsdfsdf_______')
    try {
        const resp = await cliente.findOne({ _id: idCliente })
        if (!resp) return { status: 'No fount', message: 'Cliente No existe' }
        return { status: 'ok', message: 'existe', resp }
    } catch (error) {
        return { status: 'No', message: 'Publico general' }
    }
}


module.exports = Ventas;