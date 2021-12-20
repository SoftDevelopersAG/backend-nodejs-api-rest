'use strict';

const { restart } = require('nodemon');
const SchemaProducts = require('../../../../database/collection/models/producto');
const SchemaNegocio = require('../../../../database/collection/models/negocio');

const { verificacionCamposRequeridos } = require('../../../../Utils/verifyCampos/verifyCampos');


class Products {

    static async addNewProduct(req, res, next) {
       
        try{
 
            var {idNegocio, nameTienda, nameProduct, category, subcategory, precioUnitario, precioCosto, unidadesDisponibles, colorsAvailable, estadoProduct,tipoEnvio, envioDesde, costoEnvio, tipoEnvio, marcaProduct, description} = req.body;
    
            var campos = await verificacionCamposRequeridos([idNegocio, nameProduct, category , subcategory, precioUnitario, precioCosto, unidadesDisponibles, description])
            if(!campos){
                return res.status(400).send({status:'error', message:'Faltan campos requeridos'});
            }
            
            var dataTienda = await SchemaNegocio.negocio.findById({_id:idNegocio});
            var dataProduct = await SchemaProducts.producto.findOne({nameProduct});
            if(!dataTienda) return res.status(400).send({status: 'error', message: 'Id negocio no existe'})
            if(dataProduct) return res.status(404).send({status:'error', message: 'El nombre del producto ya fue registrado'})
            
            var newProduct = new SchemaProducts.producto({
    
                idNegocio       :  idNegocio,
                nameTienda      : dataTienda.nombre?dataTienda.nombre:'',
                nameProduct     :  nameProduct?nameProduct:'',
                category        : category?category:'',
                subcategory     : subcategory?subcategory:'',
                precioUnitario  :  precioUnitario?precioUnitario:0,
                precioCosto     :  precioCosto?precioCosto:0, 
                unidadesDisponibles : unidadesDisponibles?unidadesDisponibles:0,
                colorsAvailable : colorsAvailable?colorsAvailable:'color de la foto',
                envioDesde      :  dataTienda?.city? dataTienda.city:'No definido',
                tipoEnvio       :  tipoEnvio?tipoEnvio:'gratuito',
                costoEnvio      : costoEnvio?costoEnvio:0,
                estadoProduct   :  estadoProduct?estadoProduct:'nuevo',
                marcacaproduct  : marcaProduct?marcaProduct:'',
                description     : description?description:'',
                urlImages       :  [],
                // fechaRegistro :  Date.now
                
            })
    
            var newDataProduct = await newProduct.save();

            res.status(200).send({newDataProduct})
        }
        catch(err){
            console.log('error al crear el producto\n', err);
            res.status(500).send({error: 'no creado', message: 'error al crear el producto'});
        }
      
    }


    // muestra la lista de todos los productos pertenecientes a un negocio
    static async getAllProducts(req, res, next){
        try{
            var {idNegocio} = req.body;

            var verifyCampos = await verificacionCamposRequeridos([idNegocio])
            if(!verifyCampos)return res.status(400).send({status: 'error', message: 'Faltan campos requeridos'});
           
            var dataProduct = await SchemaProducts.producto.find({idNegocio});
            res.status(200).send({status:'ok',message:"Lista de productos disponibles y activos",resutl:dataProduct})
        }
        catch(err){
            console.log('error al obtener los productos\n', err);
            res.status(500).send({error: 'No fount', message: 'error al obtener los productos'});
        }
    }

}



module.exports = Products;