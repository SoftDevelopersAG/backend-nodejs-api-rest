'use strict';

const { restart } = require('nodemon');
const SchemaProducts = require('../../../../database/collection/models/producto');
const SchemaNegocio = require('../../../../database/collection/models/negocio');
const { user } = require('../../../../database/collection/models/user');
const { redondearPrecio } = require('../../../../Utils/RedondeNumeros/redondeoPrecios')

const { verificacionCamposRequeridos } = require('../../../../Utils/verifyCampos/verifyCampos');


class Products {

    static async addNewProduct(req, res, next) {

        try {

            const { nameTienda, nameProduct, category, subcategory, precioUnitario, precioCosto,
                unidadesDisponibles, colorsAvailable, estadoProduct, tipoEnvio, envioDesde, costoEnvio,
                marcaProduct, description
            } = req.body;
            const { idNegocio, idUser } = req.params;
            const campos = await verificacionCamposRequeridos([idNegocio, idUser, nameProduct, category,
                subcategory, precioUnitario, precioCosto, unidadesDisponibles
            ]);

            if (!campos) {
                return res.status(206).send({ status: 'No fount', message: 'Faltan campos requeridos' });
            }

            const verifyUser = await user.findById({ _id: idUser })
            if (!verifyUser) return res.status(206).send({ status: 'No fount', message: 'Id negocio no existe' });

            const dataTienda = await SchemaNegocio.negocio.findById({ _id: idNegocio });
            const dataProduct = await SchemaProducts.producto.findOne({ nameProduct });
            if (!dataTienda) return res.status(206).send({ status: 'No fount', message: 'Id negocio no existe' })
            if (dataProduct) return res.status(206).send({ status: 'No fount', message: 'El nombre del producto ya fue registrado' })

            var newProduct = new SchemaProducts.producto({

                idNegocio: idNegocio,
                idUser: idUser,
                nameTienda: dataTienda.nombre ? dataTienda.nombre : '',
                nameProduct: nameProduct ? nameProduct : '',
                category: category ? category : '',
                subcategory: subcategory ? subcategory : '',
                precioUnitario: precioUnitario ? precioUnitario : 0,
                precioCosto: precioCosto ? precioCosto: 0,
                unidadesDisponibles: unidadesDisponibles ? unidadesDisponibles : 0,
                colorsAvailable: colorsAvailable ? colorsAvailable : 'color de la foto',
                envioDesde: dataTienda?.city ? dataTienda.city : 'No definido',
                tipoEnvio: tipoEnvio ? tipoEnvio : 'gratuito',
                costoEnvio: costoEnvio ? costoEnvio : 0,
                estadoProduct: estadoProduct ? estadoProduct : 'nuevo',
                marcacaproduct: marcaProduct ? marcaProduct : '',
                description: description ? description : '',
                urlImages: [],
                // fechaRegistro :  Date.now

            })

            var newDataProduct = await newProduct.save();

            res.status(200).send({
                status: 'ok',
                message: 'Se registro un producto',
                result: newDataProduct
            })
        }
        catch (err) {
            console.log('error al crear el producto\n', err);
            res.status(500).send({ status: 'No fount', error: 'no creado', message: 'error al crear el producto' });
        }

    }
    static async updateProducto(req, res) {        
        const { nameProduct, category, subcategory, precioUnitario, precioCosto, unidadesDisponibles, description } = req.body;
        const { idProducto } = req.params;

        const product = await SchemaProducts.producto.findById({ _id: idProducto });
        if (!product) return res.status(206).json({ status: 'No fount', message: 'Ese producto no existe' });
        const updateDatas = await {
            nameProduct: nameProduct || product.nameProduct,
            category: category || product.category,
            subcategory: subcategory || product.subcategory,
            precioUnitario: precioUnitario || product.precioUnitario,
            precioCosto: precioCosto || product.precioCosto,
            unidadesDisponibles: unidadesDisponibles || product.unidadesDisponibles,
            description: description || product.description,
        }
        try {
            if (product.nameProduct == nameProduct) {
                await SchemaProducts.producto.findOneAndUpdate({ _id: idProducto }, updateDatas);
                const newProduct = await SchemaProducts.producto.findOne({ _id: idProducto });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actulizo el producto',
                    result: newProduct
                });
            }
            const verifyName = await SchemaProducts.producto.findOne({ nameProduct });
            if (verifyName) {
                console.log('verifica si ese nombre existe')
                return res.status(206).json({
                    status: 'No fount',
                    message: 'No puedes actualizar con ese nombre porque ya esta registrado'
                })
            }
            await SchemaProducts.producto.findOneAndUpdate({ _id: idProducto }, updateDatas);
            const newProduct = await SchemaProducts.producto.findOne({ _id: idProducto });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actulizo el producto',
                result: newProduct
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'No se pudo actualizar los datos', error })
        }
    }


    // muestra la lista de todos los productos pertenecientes a un negocio
    static async getAllProducts(req, res, next) {
        const { idNegocio } = req.params;
        try {
            var dataProduct = await SchemaProducts.producto.find({ idNegocio });
            res.status(200).send({ status: 'ok', message: "Lista de productos disponibles y activos", result: dataProduct })
        }
        catch (err) {
            console.log('error al obtener los productos\n', err);
            res.status(500).send({ error: 'No fount', message: 'error al obtener los productos' });
        }
    }

}



module.exports = Products;