'use strict';

class Ventas{

    static async nuevaVenta(req, res, next){

        const {idNegocio, precioTotal, products, state, tipoDePago, notaVenta} = req.body;
        
        const venta = new Venta({
            idNegocio,
            precioTotal,
            products,
            state,
            tipoDePago,
            notaVenta
        });

        await venta.save();

        res.json({
            status:'ok',
            message:'Venta creada correctamente',
            result: venta
        });

    }

}


module.exports = Ventas;