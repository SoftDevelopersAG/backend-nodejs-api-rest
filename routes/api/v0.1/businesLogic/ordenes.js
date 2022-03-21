const { orden } = require('../../../../database/collection/models/orden');
const { user } = require('../../../../database/collection/models/user');
const { mesa } = require('../../../../database/collection/models/mesa');
const { negocio } = require('../../../../database/collection/models/negocio');
const { salas } = require('../../../../database/collection/models/salas');
const { producto } = require('../../../../database/collection/models/producto')

//const ObjectId = require('mongodb').ObjectId;

module.exports = class Ordenes {
    static async registerOrdenMesa(req, res) {
        const { idRestaurant, idMesero } = req.params;
        const { idMesa, listProduct } = req.body;
        if (!idMesa) return res.status(206).json({ status: 'No fount', message: 'No se esta mandando la mesa' });
        if (listProduct.length === 0) return res.status(206).json({ status: 'No fount', message: 'Seleccione producto' });

        //verificamos si ese restaurante existe
        const verifyNegocio = await validateNegocio(idRestaurant);
        if (verifyNegocio.status === 'No fount') return res.status(206).json(verifyNegocio);
        //merificar si ese mesero existe
        const verifyUser = await validateUSer(idMesero);
        if (verifyUser.status === 'No fount') return res.status(206).json(verifyUser);
        //verificar si la mesa existe
        const verifyMesa = await validateMesa(idMesa);
        if (verifyMesa.status === 'No fount') return res.status(206).json(verifyMesa);

        //verificar si los productos son validos

        //verificar si esa mesa ya esta con una orden

        try {
            const newOrden = new orden({
                idMesa,
                idMesero,
                idRestaurant,
                listProduct
            });
            /* let arr = []
            for(var i = 0; i<listProduct.length; i++){
                arr.push(new ObjectId(listProduct[i]._id))
            }
            newOrden.listProduct = arr */

            //actualizar el estado de la mesa a ocupado
            /* const verifyUpdateEstateMesa = await updateStateMesa(idMesa);
            console.log(verifyUpdateEstateMesa, ' ====================================111111111111222222222222222')

            if (verifyUpdateEstateMesa.status === 'No fount') return res.status(206).json(verifyUpdateEstateMesa) */

            const resp = await newOrden.save()
            return res.status(200).json({
                status: 'ok',
                message: 'Se registro orden del cliente',
                result: resp
            });


        } catch (error) {
            console.log('error al crear el producto', error);
            return res.status(500).send({ status: 'No fount', error: 'no creado', message: 'error al crear el producto' });
        }

    }

    static async ordenMesa(req, res) {
        const { idMesa } = req.params;
        //verificar si la mesa existe
        const verifyMesa = await validateMesa(idMesa);
        if (verifyMesa.status === 'No fount') return res.status(206).json(verifyMesa);
        try {
            const resp = await orden.findOne({ $and: [{ stateSaldo: 'sincancelar' }, { idMesa }] })
            return res.status(200).json({
                status: 'ok',
                message: 'Orden de la mesa',
                result: resp
            })
        } catch (error) {
            console.log('error\n', error);
            return res.status(500).send({ status: 'No fount', error: 'no creado', message: 'error al crear el producto' });
        }
    }

    static async updateOrden(req, res) {
        const { idOrden } = req.params;
        const { listProduct, stateOrden } = req.body;
        console.log(idOrden,' esto es ================================================')
        if (listProduct.length === 0 || listProduct === undefined)
            return res.status(206).json({ status: 'No fount', message: 'La lista de productos es obligatorio' });
        if (stateOrden == null || stateOrden == undefined)
            return res.status(206).json({ status: 'No fount', message: 'No se esta mandando el estado de la mesa' });

       //verificar si la orden existe
       const verifyOrden = await validateOrden(idOrden);
       if (verifyOrden.status === 'No fount') return res.status(206).json(verifyOrden);
        try {
            await orden.findOneAndUpdate({ _id:idOrden }, { listProduct, stateOrden });
            const resp = await orden.findOne({ _id:idOrden });
            return res.status(200).json({
                status: 'ok',
                message: 'Se actualizo la orden de la mesa',
                result: resp
            })
        } catch (error) {
            console.log('error\n', error);
            return res.status(500).send({ status: 'No fount', error: 'no creado', message: 'error al crear el producto' });
        }
    }
    //mostrar las ordenes de una mesa para el cocinero
    static async listOrdenMesaCocina(req, res) {
        //verificar si la mesa existe
        const { idRestaurante } = req.params;
        //verificamos si ese restaurante existe
        const verifyNegocio = await validateNegocio(idRestaurante);
        if (verifyNegocio.status === 'No fount') return res.status(206).json(verifyNegocio);
        try {
            const resp = await orden.find({ $and: [{ stateOrden: ['espera', 'proceso'] }, { idRestaurant: idRestaurante }] });
            let newArr = []
            for (var i = 0; i < resp.length; i++) {
                const datasMesa = await getNameMesa(resp[i].idMesa);
                if (datasMesa.status == 'No fount') return res.status(206).json(datasMesa)
                newArr.push({
                    _id:resp[i]._id,
                    idMesa: resp[i].idMesa,
                    idRestaurant: resp[i].idRestaurant,
                    mesa: datasMesa.result.nameMesa,
                    sala: datasMesa.result.nameSala,
                    listProduct: resp[i].listProduct,
                    stateSaldo: resp[i].stateSaldo,
                    stateOrden: resp[i].stateOrden,
                    dateCreate: resp[i].dateCreate
                })
            }
            return res.status(200).json({
                status: 'ok',
                message: 'Orden de la mesa',
                result: newArr
            })
        } catch (error) {
            console.log('error\n', error);
            return res.status(500).send({ status: 'No fount', error: 'no creado', message: 'error al crear el producto' });
        }
    }

    static async listOrdenesCaja(req, res) {
        const { idRestaurant } = req.params;
        console.log(idRestaurant, ' esto es')
        //verificamos si ese restaurante existe
        const verifyNegocio = await validateNegocio(idRestaurant);
        if (verifyNegocio.status === 'No fount') return res.status(206).json(verifyNegocio);

        try {
            const resp = await orden.find({ $and: [{ stateSaldo: 'sincancelar' }, { idRestaurant }] })
            let newArr = []
            for (var i = 0; i < resp.length; i++) {
                const datasMesa = await getNameMesa(resp[i].idMesa);
                if (datasMesa.status == 'No fount') return res.status(206).json(datasMesa)
                if (resp[i].stateOrden == 'enviado' ) {
                    newArr.push({
                        _id:resp[i]._id,
                        idMesa: resp[i].idMesa,
                        idRestaurant: resp[i].idRestaurant,
                        mesa: datasMesa.result.nameMesa,
                        sala: datasMesa.result.nameSala,
                        listProduct: resp[i].listProduct,
                        stateSaldo: resp[i].stateSaldo,
                        stateOrden: resp[i].stateOrden,
                        dateCreate: resp[i].dateCreate,
                        state: false
                    })
                }

            }
            return res.status(200).json({
                status: 'ok',
                message: 'Orden de la mesa',
                result: newArr
            })
        } catch (error) {
            console.log('error\n', error);
            return res.status(500).send({ status: 'No fount', error, message: 'error' });
        }
    }

    static async updateOrdenCancelado(req, res) {
        const { idOrden } = req.params;
        console.log(idOrden,' esto es ================================================')

        //verificar si la orden existe
        const verifyOrden = await validateOrden(idOrden);
        if (verifyOrden.status === 'No fount') return res.status(206).json(verifyOrden);
        try {
            await orden.findOneAndUpdate({ _id:idOrden }, { stateSaldo:'cancelado' });
            const resp = await orden.findOne({ _id:idOrden });
            return res.status(200).json({
                status: 'ok',
                message: 'Se actualizo el estado de la orden',
                result: resp
            })
        } catch (error) {
            console.log('error\n', error);
            return res.status(500).send({ status: 'No fount', error, message: 'NO se pudo actualizar el estado de la orden' });
        }
    }

}

const validateUSer = async (idMesero) => {
    try {
        const resp = await user.findById({ _id: idMesero })
        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' }
        return { status: 'ok', message: 'continiuar' }
    } catch (error) {
        console.log('error al crear el producto', error);
        return { status: 'No fount', error, message: 'No se puee mostarar los datos' };
    }
}
const validateMesa = async (idMesa) => {
    try {
        const resp = await mesa.findById({ _id: idMesa })
        if (!resp) return { status: 'No fount', message: 'Esa mesa no existe' }
        return { status: 'ok', message: 'continiuar' }
    } catch (error) {
        console.log('error al crear el producto', error);
        return { status: 'No fount', error, message: 'No se puee mostarar los datos' };
    }
}
const validateNegocio = async (idNegocio) => {
    try {
        const resp = await negocio.findById({ _id: idNegocio })
        if (!resp) return { status: 'No fount', message: 'Negocio inexistente' }
        return { status: 'ok', message: 'continiuar' }
    } catch (error) {
        console.log('error al crear el producto\n', error);
        return { status: 'No fount', error, message: 'No se puee mostarar los datos' };
    }
}
//actualizar el estado de una mesa a ocupado
const updateStateMesa = async (id_mesa) => {
    try {
        const resp = await mesa.findOne({ _id: id_mesa });
        if (!resp) return { status: 'No fount', message: 'Esa mesa no existe' }

        await mesa.findOneAndUpdate({ _id: id_mesa }, { state: !resp.state });

        const updateData = await mesa.findOne({ _id: id_mesa })
        return { status: 'ok', message: 'Continuar', result: updateData.state }
    } catch (error) {
        console.log('error al crear el producto\n', error);
        return { status: 'No fount', error, message: 'No se pudo actualizar el estado de la mesa' };
    }
}
//getNameMesa()
const getNameMesa = async (idMesa) => {
    try {
        const resp = await mesa.findOne({ _id: idMesa });
        if (!resp) return { status: 'No fount', message: 'Esa mesa no existe' };
        const nameSala = await salas.findOne({ _id: resp.idSala })
        if (!nameSala) return { status: 'No fount', message: 'Esa sala no existe' };

        return {
            status: 'ok', message: 'nombre sala y mesa', result: {
                nameMesa: resp.name,
                nameSala: nameSala.nameSala
            }
        }

    } catch (error) {
        console.log('error al crear el producto\n', error);
        return { status: 'No fount', error, message: 'No se pudo actualizar el estado de la mesa' };
    }
}
const validateOrden = async (idOrden) => {
    try {
        const resp = await orden.findById({ _id: idOrden })
        if (!resp) return { status: 'No fount', message: 'Orden no existe' }
        return { status: 'ok', message: 'continiuar' }
    } catch (error) {
        console.log('error al crear el producto', error);
        return { status: 'No fount', error, message: 'No se puee mostarar los datos' };
    }
}