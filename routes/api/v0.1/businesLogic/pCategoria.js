'use strict'
const pCategoriaSchema = require('../../../../database/collection/models/pCategoria');
const verifyCampos = require('../../../../Utils/verifyCampos/verifyCampos');
const { negocio } = require('../../../../database/collection/models/negocio');
const { user } = require('../../../../database/collection/models/user')

class PCategoria{

    static async addCategoria(req, res, next){
       try{
        const { idNegocio, idUser } = req.params;
        const { nombre } = req.body;
        console.log(req.body,'body =-=-=-=-', req.params);
        
        const stateCampos = await verifyCampos.verificacionCamposRequeridos([nombre]);
        const statusCamposParams = await verifyCampos.verificacionCamposRequeridos([ idNegocio, idUser]);
        if(!stateCampos || !statusCamposParams)return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idNegocio, idUser, nombre'});

        const verifyNegocio = await validateNegocio(idNegocio);
        const verifyUser = await validateUser(idUser);
        if(verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);
        if(verifyUser.status == 'No fount') return res.status(206).json(verifyUser);

        //verificamos si ese nombre ya esta en uso
        const verifyNombre = await validateNombre(nombre);
        if(verifyNombre.status == 'No fount') return res.status(206).json(verifyNombre);
        
        var newCatergoria = new pCategoriaSchema.pCategoria({
            idNegocio: idNegocio,
            idUser: idUser,
            nombre: nombre
        });
        var result = await newCatergoria.save();
        if(!result)return res.status(206).send({status: 'No fount', message: 'Error al guardar la categoria'});
        return res.status(200).send({status: 'ok', message: 'Categoria guardada', result});
       }catch(error){
        res.status(400).send({status: 'No fount', message: 'Error al guardar la categoria', error});
       }
    }


    static async updatePcategoria(req, res, next){
        try{
            const {idPcategoria} = req.params;
            const {nombre} = req.body;
            const stateCampos = await verifyCampos.verificacionCamposRequeridos([idPcategoria, nombre]);
            if(!stateCampos) return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idPcategoria, nombre'});

            const verifyIdPcatigoria = await validateIdPcategoria(idPcategoria);
            if(verifyIdPcatigoria.status == 'No fount') return res.status(206).json(verifyIdPcatigoria);

            const verifyNombreCategoria = await validateNombre(nombre);
            console.log(verifyNombreCategoria, '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
            if(verifyNombreCategoria.status == 'No fount') return res.status(206).json(verifyNombreCategoria)

            var result = await pCategoriaSchema.pCategoria.findByIdAndUpdate({_id: idPcategoria}, {nombre: nombre});
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al actualizar la categoria'});

            var resultData=await pCategoriaSchema.pCategoria.findById({_id: idPcategoria});
            return res.status(200).send({status: 'ok', message: 'Categoria actualizada', resultData});
        }
        catch(error){
            res.status(400).send({status: 'No fount', message: 'Error al actualizar la categoria', error});
        }
    }

    static async getDetailPcategoria(req,res, next){
        try{
            const {idPcategoria} = req.params;
            const result = await pCategoriaSchema.pCategoria.findById({_id: idPcategoria}).populate('subcategorias');
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al obtener la categoria'});
            return res.status(200).send({status: 'ok', message: 'Categoria obtenida', result});
        }catch(error){
            res.status(400).send({status: 'No fount', message: 'Error al obtener la categoria', error});
        }
    }

    static async getAllCategoria(req, res, next){
        try{
            const {idNegocio} = req.params;
            const result = await pCategoriaSchema.pCategoria.find({idNegocio: idNegocio}).populate('subcategorias');
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al obtener las categorias'});
            return res.status(200).send({status: 'ok', message: 'Categorias obtenidas', result});
        }catch(error){
            res.status(400).send({status: 'No fount', message: 'Error al obtener las categorias', error});
        }
    }

    // subcategorias
    static async addSubCategoria(req, res, next){
       try{
            const { idPcategoria, idUser } = req.params;
            const { nombre } = req.body;
            const stateCampos = await verifyCampos.verificacionCamposRequeridos([idPcategoria, nombre]);
            const statusCamposParams = await verifyCampos.verificacionCamposRequeridos([ idPcategoria, idUser]);
            if(!stateCampos || !statusCamposParams)return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idPcategoria, idUser, nombre'});

            const verifyUser = await validateUser(idUser);
            if(verifyUser.status == 'No fount') return res.status(206).json(verifyUser);

            const verifyIdPcatigoria = await validateIdPcategoria(idPcategoria);
            if(verifyIdPcatigoria.status == 'No fount') return res.status(206).json(verifyIdPcatigoria);

            const verifyNameSubcategoria = await validateNameSubCategoria(nombre);
            if(verifyNameSubcategoria.status == 'No fount') return res.status(206).json(verifyNameSubcategoria)
            
            var newSubCatergoria = new pCategoriaSchema.pSubcategoria({
                idPcategoria: idPcategoria,
                idUser: idUser,
                nombre: nombre
            });

            var result = await newSubCatergoria.save();
            var resultPcategoria = await pCategoriaSchema.pCategoria.findById({_id: idPcategoria});
            console.log(resultPcategoria);
            var aux = resultPcategoria.subcategorias;
            var subcategorias = await [...aux, result._id];
            var resultPcategoriaUpdate = await pCategoriaSchema.pCategoria.findByIdAndUpdate({_id: idPcategoria}, {subcategorias});
            if(!result)return res.status(206).send({status: 'No fount', message: 'Error al guardar la subcategoria'});
            return res.status(200).send({status: 'ok', message: 'Subcategoria guardada', result});
       }catch(error){
           res.status(400).send({status: 'No fount', message: 'Error al guardar la subcategoria', error});
       }
    }

    static async updatePsubcategoria(req, res, next){
        try{
            const {idPsubcategoria} = req.params;
            const {nombre} = req.body;
            const stateCampos = await verifyCampos.verificacionCamposRequeridos([idPsubcategoria, nombre]);
            if(!stateCampos) return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idPsubcategoria, nombre'});

            const verifyIdSubcategoria = await validateIdSubCategoria(idPsubcategoria);
            if(verifyIdSubcategoria.status == 'No fount') return res.status(206).json(verifyIdSubcategoria)

            const verifyNameSubcategoria = await validateNameSubCategoria(nombre);
            if(verifyNameSubcategoria.status == 'No fount') return res.status(206).json(verifyNameSubcategoria)

            var result = await pCategoriaSchema.pSubcategoria.findByIdAndUpdate({_id: idPsubcategoria}, {nombre: nombre});
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al actualizar la subcategoria'});
            var resultData=await pCategoriaSchema.pSubcategoria.findById({_id: idPsubcategoria});
            return res.status(200).send({status: 'ok', message: 'Subcategoria actualizada', resultData});
        }catch(error){
            res.status(400).send({status: 'No fount', message: 'Error al actualizar la subcategoria', error});
        }
    }
}   

async function validateNegocio(idNegocio) {
    try {
        const resp = await negocio.findById({ _id: idNegocio });
        if (!resp) return { status: 'No fount', message: 'NO existe ese negocio' };
        return { status: 'ok', message: 'Existe', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'Error 400', error }
    }
}
//verificamos si ese usuario existe
const validateUser = async (id_user) => {
    try {
        const resp = await user.findById({ _id: id_user });
        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' };
        return { status: 'ok', message:'existe' }
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'Error 400' }
    }
}
//verificar si nombre ya esta registrado
const validateNombre = async(nombre)=>{
    try {
        const resp = await pCategoriaSchema.pCategoria.findOne({ nombre });
        if (resp) return { status: 'No fount', message: 'Ese nombre ya esta registrado' };
        return { status: 'ok', message:'No existe' }
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'Error 400' }
    }
}
const validateIdPcategoria = async (idPcategoria) => {
    try {
        const resp = await pCategoriaSchema.pCategoria.findById({ _id:idPcategoria });
        if (!resp) return { status: 'No fount', message: 'Categoria no valida' };
        return { status: 'ok', message:'Existe' }
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'Error 400' }
    }
}

//validar nombre de la sub categoria
const validateNameSubCategoria = async (nombre)=>{
    try {
        const resp = await pCategoriaSchema.pSubcategoria.findOne({ nombre });
        if (resp) return { status: 'No fount', message: 'Nombre ya registrado' };
        return { status: 'ok', message:'No existe' }
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'Error 400' }
    }
}

//validar id subcategoria
const validateIdSubCategoria = async (idSubCategoria)=>{
    try {
        const resp = await pCategoriaSchema.pSubcategoria.findById({ _id: idSubCategoria});
        if (!resp) return { status: 'No fount', message: 'Subcategoria no valida' };
        return { status: 'ok', message:'Existe' }
    } catch (error) {
        console.log(error);
        return {status: 'No fount', message: 'Error 400' }
    }
}


module.exports = PCategoria;