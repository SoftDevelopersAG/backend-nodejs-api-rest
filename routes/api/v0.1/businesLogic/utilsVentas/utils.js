'use strict';
const productSchema = require('../../../../../database/collection/models/producto');
const VentaSchema = require('../../../../../database/collection/models/venta')
const NegocioSchema = require('../../../../../database/collection/models/negocio');
const { user } = require('../../../../../database/collection/models/user');
const { cliente } = require('../../../../../database/collection/models/clientes');
const { updateEstadoFinanciero } = require('../estadoFinanciero');

class UtilsVentas {

    // verifica los campos requeridos de cada producto vendido
    static async verifyListProducts(res, ArrayListProducts) {
        /* console.log('================================================================')
        console.log(ArrayListProducts)
        console.log('================================================================')
         */
        try {

            for (var i = 0; i < ArrayListProducts.length; i++) {
                if (ArrayListProducts[i].idProduct === undefined || ArrayListProducts[i].idProduct === null || ArrayListProducts[i].idProduct === '') return { status: 'No fount', error: "error", message: "Comple los campos requeridos, idProduct" };
                if (ArrayListProducts[i].precio === undefined || ArrayListProducts[i].precio === null || ArrayListProducts[i].precio === '') return { status: 'No fount', error: "error", message: "Comple los campos requeridos" };
                if (ArrayListProducts[i].nombre === undefined || ArrayListProducts[i].nombre === null || ArrayListProducts[i].nombre === '') return { status: 'No fount', error: "error", message: "Comple los campos requeridos" };
                if (parseInt(ArrayListProducts[i].precio) <= 0) return { status: 'No fount', error: "error", message: `Para realizar la venta el precio del prodcuto ${ArrayListProducts[i].idProduct} debe ser mayor a 0` };
            }
            return { status: 'ok' };
        }
        catch (err) {
            console.log('error en utilVentas');
            return { status: 'No fount' };;
        }
    }


    // verifica que los productos efectivamente esten registrados en la base de datos
    static async comprovacionDeProductosInDB(res, ArrayListProducts) {
        // console.log(ArrayListProducts)

        try {
            for (var i = 0; i < ArrayListProducts.length; i++) {
                const resp = await productSchema.producto.findById({ _id: ArrayListProducts[i].idProduct });
                if (!resp) return res.status(400).send({ error: "error", message: `El producto ${ArrayListProducts[i].idProduct} no existe` });
            }
            return true;
        }
        catch (err) {
            console.log('error en utilsVentas', err);
            return false;
        }
    }


    // crea una nueva un nuevo producto en la base de datos pVenta 
    static async createVenta(res, ArrayListProducts, idNegocio, precioTotal, cliente, idUser, pagoCliente, cambioCliente) {

        try {
            const DataResult = await createPventas(ArrayListProducts);
            const dataNegocio = await NegocioSchema.negocio.findById({ _id: idNegocio });//falta control de esto
            const dataVenta = await VentaSchema.Venta.find({ idNegocio: idNegocio });

            var newVenta = new VentaSchema.Venta({
                idNegocio: dataNegocio._id,
                idUser: idUser,
                idCLiente: cliente,
                nit: dataNegocio.nit,
                venta: dataVenta.length + 1,
                precioTotal: precioTotal,
                precioTotalBackend: DataResult.precioTotalBackend,
                products: DataResult.listPventas,
                state: 'Cancelado',
                tipoDePago: 'efectivo',
                pagoCliente: pagoCliente,
                cambioCliente: cambioCliente,
                notaVenta: []
            })

            var resultVenta = await newVenta.save();

            await updateEstadoFinanciero(idNegocio, resultVenta._id, resultVenta.precioTotalBackend, "venta");//el backend falla si esta funcion tiene error
            var nVenta = await VentaSchema.Venta.findOne({ _id: resultVenta._id }).populate('products');
            return res.status(200).send({ status: "ok", message: `Venta creada con exito`, result: nVenta })
        } catch (error) {
            console.log('error en utilsVentas\n', error);
            return res.status(400).send({ status: 'No fount', error: "error", message: `Error al crear la venta` })
        }
    }
    //verficamos si el usuario existe
    static async validateUser(idUser) {
        try {
            const resp = await user.findById({ _id: idUser })
            if (resp) return { status: 'ok', message: 'Usuario si existe', result: resp }
            return { status: 'No fount', message: 'Ese usuario no existe' }
        } catch (error) {
            console.log(error);
            return { status: 'No fount', message: 'Ese usuario no existe' }
        }
    }
    //verificamos si el cliente existe
    static async validateCliente(idCliente) {
        try {
            const resp = await cliente.findById({ _id: idCliente })
            if (resp) return { status: 'ok', message: 'Cliente existe', result: resp }
            return { status: 'No fount', message: 'Ese cliente no existe' }
        } catch (error) {
            console.log(error);
            return { status: 'No fount', message: 'Cliente no existe' }
        }
    }
}


// create new Pventa anr save in DB
const createPventas = async (ArrayListProducts) => {
    try {
        const DATA_RESULT = { precioTotalBackend: 0, listPventas: [] };
        var subTotal = 0;
        for (var i = 0; i < ArrayListProducts.length; i++) {
            const dataProduct = await productSchema.producto.findById({ _id: ArrayListProducts[i].idProduct });
            subTotal = subTotal + dataProduct.precioUnitario;
            var newPvendido = new VentaSchema.pvendido({
                idNegocio: dataProduct.idNegocio ? dataProduct.idNegocio : 'no asingando',
                idProduct: dataProduct._id ? dataProduct._id : 'no asingando',
                nameProduct: dataProduct.nameProduct ? dataProduct.nameProduct : 'no asignado',
                category: dataProduct.category ? dataProduct.category : 'no asignado',
                subcategory: dataProduct.subcategory ? dataProduct.subcategory : 'no asignado',

                unidadesVendidos: 0,
                precioUnitario: dataProduct.precioUnitario ? dataProduct.precioUnitario : 0,
                precioCosto: dataProduct.precioCosto ? dataProduct.precioCosto : 0,

                envioDesde: dataProduct.envioDesde ? dataProduct.envioDesde : 'no asignado',
                costoEnvio: dataProduct.costoEnvio ? dataProduct.costoEnvio : 0,
                estadoProduct: dataProduct.estadoProduct ? dataProduct.estadoProduct : 'no asignado',
                detalleVenta: ArrayListProducts[i].description ? ArrayListProducts[i].description : 'no asignado',
                urlImages: dataProduct.urlImages ? dataProduct.urlImages : [],
            })
            var dataPv = await newPvendido.save();

            DATA_RESULT.precioTotalBackend = subTotal;
            DATA_RESULT.listPventas.push(dataPv);
        }
        return DATA_RESULT;
    }
    catch (err) {
        console.log('error en utilsVentas, createPventas\n', err);
        return false;
    }
}


module.exports = UtilsVentas;