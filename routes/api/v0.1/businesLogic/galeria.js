const { galeria } = require('../../../../database/collection/models/galeria');
const { user } = require("../../../../database/collection/models/user");
const { negocio } = require("../../../../database/collection/models/negocio");

const path = require('path');
const fs = require('fs-extra');


class GaleriaRoutes {
    static async create(req, res) {
        const { idUser, idNegocio } = req.params;
        const { name, price, description, type } = req.body;
        const ruta = req.file?.path.substr(6);

        const verifyUser = await validateUser(idUser);
        const stateValidateIdNegocio = await validateIdNeogocio(idNegocio);
        if (stateValidateIdNegocio.status == 'No fount') return res.status(206).json(stateValidateIdNegocio);
        if (verifyUser.status == 'No fount') return res.status(206).json(verifyUser);
        const verifyGaleria = await validateName(name);
        if (verifyGaleria.status == 'No fount') return res.status(206).json(verifyGaleria);

        const verifyDatas = await validateDatas(name, price, type, ruta)
        if (verifyDatas.status == 'No fount') return res.status(206).json(verifyDatas);

        const newGaleria = new galeria({
            idUser,
            idNegocio,
            name,
            price,
            description,
            type,
            img: ruta
        });

        try {
            const resp = await newGaleria.save();
            return res.status(200).json({
                status: 'ok',
                message: 'Datos guardados correctamente',
                result: resp
            })

        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }

    static async list(req, res) {
        const { idNegocio } = req.params;
        try {
            const resp = await galeria.find({ idNegocio });
            return res.status(200).json({
                status: 'ok', 
                message: 'Lista de imagenes de la galeria',
                result: resp
            })
        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }

    static async update(req, res) {
        const { idGalery } = req.params;
        const { name, price, description, type } = req.body;
        const ruta = req.file?.path.substr(6);
        const verifyIdGaleria = await valideteOneGalery(idGalery)
        if (verifyIdGaleria.status == 'No fount') return res.status(206).json(verifyIdGaleria);

        if (ruta) {
            fs.unlink(path.resolve(`public/${verifyIdGaleria.result.img}`))// esto linea de codigo borra el archivo de la carpeta
        }

        const updateDatas = {
            name: name || verifyIdGaleria.result.name,
            price: price || verifyIdGaleria.result.price,
            description: description || verifyIdGaleria.result.description,
            type: type || verifyIdGaleria.result.type,
            img: ruta || verifyIdGaleria.result.img
        }
        try {
            if (verifyIdGaleria.result.name == name) {
                await galeria.findOneAndUpdate({ _id: idGalery }, updateDatas);
                const newGalery = await galeria.findOne({ _id: idGalery });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actualizaron los datos',
                    result: newGalery
                });
            }

            const verifyName = await validateName(name);
            if (verifyName.status == 'No fount') return res.status(206).json(verifyName);

            await galeria.findOneAndUpdate({ _id: idGalery }, updateDatas);
            const newGalery = await galeria.findOne({ _id: idGalery });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actualizaron los datos',
                result: newGalery
            });


        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
    static async delete(req, res) {
        const { idGalery } = req.params;
        const verifyIdGaleria = await valideteOneGalery(idGalery)
        if (verifyIdGaleria.status == 'No fount') return res.status(206).json(verifyIdGaleria);

        if(verifyIdGaleria.result.img){
            fs.unlink(path.resolve(`public/${verifyIdGaleria.result.img}`))// esto linea de codigo borra el archivo de la carpeta
        }
        try {
            const resp = await galeria.deleteOne({ _id: idGalery });
            return res.status(200).json({
                status: 'ok',
                message: 'Se elimino un archivo de la galeria',
                result: resp
            })
        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
}

async function validateDatas(name, price, type, ruta) {
    if (!name) return { status: 'No fount', message: 'Nombre es obligatorio', name: 'name' };
    if (!price) return { status: 'No fount', message: 'Precio es obligatorio', name: 'price' };
    if (!type) return { status: 'No fount', message: 'Tipo es obligatorio', name: 'type' };
    if (!ruta) return { status: 'No fount', message: 'Seleccione una imagen o video', name: 'img' };
    return { status: 'ok', message: 'Continuar' }

}
async function validateUser(idUSer) {
    //console.log(idUSer, ' sdfsdfsdf_______')
    try {
        const resp = await user.findOne({ _id: idUSer })
        if (!resp) return { status: 'Not fount', message: 'Ese usuario no existe' }
        return { status: 'ok', message: 'usuario si existe', resp }
    } catch (error) {
        console.log(error);
        return { status: 'Not fount', message: 'Ese usuario no existe' }
    }
}
async function validateIdNeogocio(idNegocio) {

    try {
        const resp = await negocio.findById({ _id: idNegocio });
        if (!resp) return { status: 'No fount', message: 'No existe ese negocio' }
        return { status: 'ok', message: 'existe' }
    }
    catch (error) {
        console.log('error in validateIdNeogocio\n', 'idNegocio novalido');
        return { status: 'No fount', message: 'erro 400' }
    }
}

async function validateName(name) {
    try {
        const resp = await galeria.findOne({ name });
        if (resp) return { status: 'No fount', message: 'Ese nombre ya esta en uso' };
        return { status: 'ok', message: 'Continuar' }
    } catch (error) {
        console.log(error)
        return { status: 'No fount', message: 'erro 400' }
    }
}

async function valideteOneGalery(idGalery) {
    try {
        const resp = await galeria.findById({ _id: idGalery });
        if (!resp) return { status: 'No fount', message: 'No se encontraron datos' };
        return { status: 'ok', message: 'Continuar', result: resp }
    } catch (error) {
        console.log(error)
        return { status: 'No fount', message: 'erro 400' }
    }
}

module.exports = GaleriaRoutes;