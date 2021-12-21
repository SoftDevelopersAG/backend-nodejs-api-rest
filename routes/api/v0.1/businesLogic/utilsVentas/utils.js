'use strict';
const productSchema = require('../../../../../database/collection/models/producto');
const VentaSchema = require('../../../../../database/collection/models/venta')
const NegocioSchema = require('../../../../../database/collection/models/negocio');
const { updateEstadoFinanciero } = require('../estadoFinanciero');

class UtilsVentas{

    // verifica los campos requeridos de cada producto vendido
    static async verifyListProducts(res, ArrayListProducts){
        console.log(ArrayListProducts)
    
        try{

            for(var i=0; i<ArrayListProducts.length; i++){
                if(ArrayListProducts[i].idProduct === undefined || ArrayListProducts[i].idProduct === null || ArrayListProducts[i].idProduct === '') return res.status(400).send({error:"error", message:"Comple los campos requeridos, idProduct"});
                if(ArrayListProducts[i].precioUnitario === undefined || ArrayListProducts[i].precioUnitario === null || ArrayListProducts[i].precioUnitario === '')  return res.status(400).send({error:"error", message:"Comple los campos requeridos"}); 
                if(ArrayListProducts[i].detalleVenta === undefined || ArrayListProducts[i].detalleVenta === null || ArrayListProducts[i].detalleVenta === '')  return res.status(400).send({error:"error", message:`Comple los campos requeridos del producto, detalleVenta}`});
                if(parseInt(ArrayListProducts[i].precioUnitario) <=0) return res.status(400).send({error:"error", message:`Para telizar la venta el precio del prodcuto ${ArrayListProducts[i].idProduct} debe ser mayor a 0`});
            }
            return true;
        }
        catch(err){
            console.log('error en utilVentas', err);
            return false;
        }
    }


    // verifica que los productos efectivamente esten registrados en la base de datos
    static async comprovacionDeProductosInDB(res, ArrayListProducts){
        // console.log(ArrayListProducts)
    
        try{
            for(var i=0; i<ArrayListProducts.length; i++){
                const resp = await productSchema.producto.findById({ _id: ArrayListProducts[i].idProduct });
                if(!resp) return res.status(400).send({error:"error", message:`El producto ${ArrayListProducts[i].idProduct} no existe`});
            }
            return true;
        }   
        catch(err){
            console.log('error en utilsVentas', err);
            return false;
        }
    }


    // crea una nueva un nuevo producto en la base de datos pVenta 
    static async createVenta(res, ArrayListProducts, idNegocio, precioTotal){
    
        try {
            const DataResult = await createPventas(ArrayListProducts);
            const dataNegocio = await NegocioSchema.negocio.findById({ _id: idNegocio });
            const dataVenta = await VentaSchema.Venta.find({ idNegocio: idNegocio });
    
            var newVenta = new VentaSchema.Venta({
                idNegocio: dataNegocio._id,
                nit: dataNegocio.nit,
                venta: dataVenta.length + 1,
                precioTotal: precioTotal,
                precioTotalBackend: DataResult.precioTotalBackend,
                products: DataResult.listPventas,
                state: 'pendiente',
                tipoDePago:'efectivo',
                notaVenta:[]
            })
    
            var resultVenta = await newVenta.save();
    
            updateEstadoFinanciero(idNegocio, resultVenta._id,resultVenta.precioTotalBackend, "venta" );
            var nVenta = await  VentaSchema.Venta.findOne({_id: resultVenta._id}).populate('products');
            res.status(200).send({status:"ok", message:`Venta creada con exito`, data:nVenta})
        } catch (error) {
            console.log('error en utilsVentas\n', error);
            return res.status(400).send({error:"error", message:`Error al crear la venta`})
        }
    }
}


// create new Pventa anr save in DB
const createPventas=async ( ArrayListProducts )=>{
    try{
        const DATA_RESULT={precioTotalBackend:0, listPventas:[]};
        var subTotal=0;
        for(var i=0; i<ArrayListProducts.length; i++){
            const dataProduct = await productSchema.producto.findById({ _id: ArrayListProducts[i].idProduct });
            subTotal = subTotal + dataProduct.precioUnitario;
            var newPvendido = new VentaSchema.pvendido({
                idNegocio:dataProduct.idNegocio?dataProduct.idNegocio:'no asingando',
                idProduct:dataProduct._id?dataProduct._id:'no asingando',
                nameProduct:dataProduct.nameProduct?dataProduct.nameProduct:'no asignado',
                category:dataProduct.category?dataProduct.category:'no asignado',
                subcategory:dataProduct.subcategory?dataProduct.subcategory:'no asignado',     
                unidadesVendidos:dataProduct.unidadesVendidos?dataProduct.unidadesVendidos:0, 
                precioUnitario:dataProduct.precioUnitario?dataProduct.precioUnitario:0,  
                envioDesde:dataProduct.envioDesde?dataProduct.envioDesde:'no asignado',
                costoEnvio:dataProduct.costoEnvio?dataProduct.costoEnvio:0,
                estadoProduct:dataProduct.estadoProduct?dataProduct.estadoProduct:'no asignado',
                detalleVenta:ArrayListProducts[i].detalleVenta?ArrayListProducts[i].detalleVenta:'no asignado',   
                urlImages:dataProduct.urlImages?dataProduct.urlImages:[],
            })
            var dataPv = await newPvendido.save();

            DATA_RESULT.precioTotalBackend = subTotal;
            DATA_RESULT.listPventas.push(dataPv);
        }
        return DATA_RESULT;
    }   
    catch(err){
        console.log('error en utilsVentas, createPventas\n', err);
        return false;
    }
}


module.exports = UtilsVentas;