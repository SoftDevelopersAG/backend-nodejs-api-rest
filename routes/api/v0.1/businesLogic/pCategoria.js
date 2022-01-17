'use strict'
const pCategoriaSchema = require('../../../../database/collection/models/pCategoria');
const verifyCampos = require('../../../../Utils/verifyCampos/verifyCampos');

class PCategoria{

    static async addCategoria(req, res, next){
       try{
        const { idNegocio, idUser } = req.params;
        const { nombre } = req.body;
        console.log(req.body, req.params);
        const stateCampos = await verifyCampos.verificacionCamposRequeridos([nombre]);
        const statusCamposParams = await verifyCampos.verificacionCamposRequeridos([ idNegocio, idUser]);
        if(!stateCampos || !statusCamposParams)return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idNegocio, idUser, nombre'});
        
        var newCatergoria = new pCategoriaSchema.pCategoria({
            idNegocio: idNegocio,
            idUser: idUser,
            nombre: nombre
        });
        var result = await newCatergoria.save();
        if(!result)return res.status(206).send({status: 'No fount', message: 'Error al guardar la categoria'});
        return res.status(200).send({status: 'Ok', message: 'Categoria guardada', result});
       }catch(error){
        res.status(400).send({status: 'Bad Request', message: 'Error al guardar la categoria', error});
       }
    }


    static async updatePcategoria(req, res, next){
        try{
            const {idPcategoria} = req.params;
            const {nombre} = req.body;
            const stateCampos = await verifyCampos.verificacionCamposRequeridos([idPcategoria, nombre]);
            if(!stateCampos) return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idPcategoria, nombre'});
            var result = await pCategoriaSchema.pCategoria.findByIdAndUpdate({_id: idPcategoria}, {nombre: nombre});
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al actualizar la categoria'});
            var resultData=await pCategoriaSchema.pCategoria.findById({_id: idPcategoria});
            return res.status(200).send({status: 'Ok', message: 'Categoria actualizada', resultData});
        }
        catch(error){
            res.status(400).send({status: 'Bad Request', message: 'Error al actualizar la categoria', error});
        }
    }

    static async getDetailPcategoria(req,res, next){
        try{
            const {idPcategoria} = req.params;
            const result = await pCategoriaSchema.pCategoria.findById({_id: idPcategoria}).populate('subcategorias');
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al obtener la categoria'});
            return res.status(200).send({status: 'Ok', message: 'Categoria obtenida', result});
        }catch(error){
            res.status(400).send({status: 'Bad Request', message: 'Error al obtener la categoria', error});
        }
    }

    static async getAllCategoria(req, res, next){
        try{
            const {idNegocio} = req.params;
            const result = await pCategoriaSchema.pCategoria.find({idNegocio: idNegocio}).populate('subcategorias');
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al obtener las categorias'});
            return res.status(200).send({status: 'Ok', message: 'Categorias obtenidas', result});
        }catch(error){
            res.status(400).send({status: 'Bad Request', message: 'Error al obtener las categorias', error});
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
            return res.status(200).send({status: 'Ok', message: 'Subcategoria guardada', result});
       }catch(error){
           res.status(400).send({status: 'Bad Request', message: 'Error al guardar la subcategoria', error});
       }
    }

    static async updatePsubcategoria(req, res, next){
        try{
            const {idPsubcategoria} = req.params;
            const {nombre} = req.body;
            const stateCampos = await verifyCampos.verificacionCamposRequeridos([idPsubcategoria, nombre]);
            if(!stateCampos) return res.status(206).send({status: 'No fount', message: 'Faltan campos requeridos', exaple: 'idPsubcategoria, nombre'});
            var result = await pCategoriaSchema.pSubcategoria.findByIdAndUpdate({_id: idPsubcategoria}, {nombre: nombre});
            if(!result) return res.status(206).send({status: 'No fount', message: 'Error al actualizar la subcategoria'});
            var resultData=await pCategoriaSchema.pSubcategoria.findById({_id: idPsubcategoria});
            return res.status(200).send({status: 'Ok', message: 'Subcategoria actualizada', resultData});
        }catch(error){
            res.status(400).send({status: 'Bad Request', message: 'Error al actualizar la subcategoria', error});
        }
    }
}   



module.exports = PCategoria;