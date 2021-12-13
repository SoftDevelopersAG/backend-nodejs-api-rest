'use strict'

const Negocio = require('../../../../database/collection/models/negocio');
const UplaoFile = require('../../../../Utils/uploadFile'); 
// const Owner = require('../../../database/collection/user')
const UsageControl = require('./usageControl')



// crecion de un nuevo negocios 
const createNegocio = async (req, res)=>{

        console.log(req.body)

        if(
            req.body.nombre  == "" || req.body.nombre == undefined ||
            req.body.idClient  =="" || req.body.idClient == undefined ||
            req.body.propietario =="" || req.body.propietario== undefined ||
            req.body.address  =="" || req.body.address == undefined ||
            req.body.phoneNumber  =="" || req.body.phoneNumber == undefined ||
            req.body.callingCodes =="" || req.body.callingCodes== undefined ||
            req.body.country =="" || req.body.country== undefined ||
            req.body.city  =="" || req.body.city == undefined ||
            req.body.description =="" || req.body.description== undefined ||
            req.body.category =="" || req.body.category== undefined ||
            req.body.subcategory =="" || req.body.subcategory== undefined ||
            req.body.flagCountry  =="" || req.body.flagCountry == undefined 

        ){
            return res.status(400).send({
                error:"negocio no creado",
                message:"complete los campos requeridos"
            }) 
        }

        var slugName= await req.body.nombre.toLowerCase();

        var newNegocio = new Negocio.negocio({
            nombre: req.body.nombre,
            slug:slugName.replace(/ /g,'-'),
            idClient : req.body.idClient!=undefined && req.body.idClient!=''?req.body.idClient : '',
            nit: req.body.nit?req.body.nit : '',
            propietario: req.body.propietario,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            callingCodes:req.body.callingCodes,
            country:req.body.country,
            city:req.body.city,
            description: req.body.description,
            category:req.body.category,
            subcategory:req.body.subcategory,
            flagCountry:req.body.flagCountry,
            log: 0,
            lat: 0,
            urlLogo:'',
            urlFotoLugar:''
        
        })
        
       
    
       const nombre = await Negocio.negocio.find({nombre:req.body.nombre});
       const nit = await Negocio.negocio.find({nit:req.body.nit});
       if(nombre.length>0){
           console.log('nombre existente')
            return res.status(400).send({error:'No se puede crear la tienda virtual',message:'nombre de la tienda existente'})
            
       }
       if(nit.length>0 && req.body.nit!=''){
            console.log('nit registrado');
             return res.status(400).send({err:'El Nit ya fue registrdo',message:'El número de Nit ya fue resgistrado'})
       }

       newNegocio.save( async (err, data)=>{
        //    if(err) throw err;
           if(err){
               res.status(400).send({err:'no se guardaron los datos'})
           }
           try {
                var state = await UsageControl.createUsageControl(data);
                await  Negocio.negocio.findByIdAndUpdate({_id:data._id},{state})
                
           } catch (error) {
               console.log({error:'error en usageControl', error})
           }

           

           res.status(200).send({
            status: 'ok', 
            message: 'negocio creado',  
            data
            })
       })
    
}

const showNegocioId=async (req, res)=>{
   try{
        var negocio = await Negocio.negocio.findById({_id:req.params.idnegocio})
        if(!negocio) return res.status(400).send({status:404, error:'id no valido', message:"negocio no encontrado"})
        return res.status(200).send({status:"Ok",result:negocio})
   }
   catch(err){

        return res.status(400).send({status:404, error:'id no valido', message:"negocio no encontrado"})
   }
}

// recibe logo, y fotolugar u otros 
const uploadLogo = (req, res)=>{
    // recibe el file atraves del req. y la fucoin upload se encarga de guardar el logo y el fotolugar
    UplaoFile.uploadFile(req, res)
}


const uploadLocation = async (req, res) =>{
    var lat = req.body.lat;
    var log = req.body.log;
    if(!lat) return res.status(400).send({error:'latitud requerido'});
    if(!log) return res.status(300).send({error: 'Longitud es requerido'});

    console.log(req.params)
//     var n = await Negocio.negocio.findById({_id:req.params.idnegocio}).exec()
// console.log(n)
    
    Negocio.negocio.findById({_id: req.params.idnegocio}, async (error,data)=>{
        if(error) return res.status(400).send({error: 'ID restaurant no valido'});
        if(data){

            var result = await  Negocio.negocio.findByIdAndUpdate({_id:req.params.idnegocio},{lat, log});
            var newResult = await Negocio.negocio.findById({_id:req.params.idnegocio});
            res.status(200).send({restaurant: newResult});
        }else{
            res.status(400).send({error: 'ID restaurant no encontrado'})
        }
    })
}

const listarNegocios = async (req, res)=>{
    
    var negocios = await Negocio.negocio.find({}).sort({fechaDeRegistro:1})
    return res.status(200).send({message:"ok",results:negocios.length,negocios});
}


const listartNegociosForId = async (req, res) => {
    console.log(req.params)
    try {
        
        var negocios = await Negocio.negocio.find({idClient:req.params.idowner,state:"active"}).sort({fechaDeRegistro:1});
        res.status(200).send({message:"ok",results:negocios.length, negocios})
    } catch (error) {
        res.status(400).send({error:"error en la consulta"});
    }
    
}


// no elimina el negocio solo cambia el stste del negocio  a "deleted"
const deleteNegocio =(req, res)=>{

   try{
        var stateNegocio = {
            state:'deleted'
        }
        Negocio.negocio.findByIdAndUpdate({_id:req.body.idNegocio},stateNegocio,(err, data)=>{
            if(err)return res.status(400).send({error:'error al eliminar'});
            if(data)return res.status(200).send({deleted:'negocio eliminado',data})
        })
   }
   catch(err){
        res.status(400).send({status:"error", error:'error al dar de baja'});
   }

}


const updateDataNegocio = async (req, res) => {
    
   try{
    var result = await Negocio.negocio.findById({_id:req.body.idNegocio});
    if(!result) return res.status(400).send({error: 'ID restaurante no valido'});
    if(result){

        console.log(result)
        console.log(req.body)
       var nombre      = req.body.nombre!=undefined && req.body.nombre!= ''?req.body.nombre:result.nombre;
       var slug= req.body.nombre!=undefined && req.body.nombre!= ''?req.body.nombre.replace(" ","-"):result.nombre ;
       var category   = req.body.category!=undefined && req.body.category!= ''?req.body.category:result.category;
       var subcategory   = req.body.subcategory!=undefined && req.body.subcategory!= ''?req.body.subcategory:result.subcategory;
       var country   = req.body.country!=undefined && req.body.country!= ''?req.body.country:result.country;
       var city   = req.body.city!=undefined && req.body.city!= ''?req.body.city:result.city;
       var callingCodes   = req.body.callingCodes!=undefined && req.body.callingCodes!= ''?req.body.callingCodes:result.callingCodes;
       var description = req.body.description!=undefined && req.body.description!= ''?req.body.description:result.description;
       var nit         = req.body.nit!=undefined && req.body.nit!=''?req.body.nit:result.nit;
       var propietario = req.body.propietario!=undefined && req.body.propietario!=''?req.body.propietario:result.propietario;
       var address       = req.body.address!=undefined && req.body.address!=''?req.body.address:result.address;
       var phoneNumber    = req.body.phoneNumber!=undefined && req.body.phoneNumber!=''?req.body.phoneNumber:result.phoneNumber;

       Negocio.negocio.findByIdAndUpdate({_id:result._id},{nombre,category,subcategory,country, callingCodes,description,nit, propietario, address, phoneNumber, slug, city},async (error, data)=>{
           if(error) return res.status(400).send({error:'Error en la actualizacion de los datos'});
           if(!data) return res.status(400).send({error: 'idrestaurant no valido'});
           if(data){
               var  newResul = await Negocio.negocio.findById({_id:result._id});
               console.log('ok-update data')
               console.log(newResul)
               res.status(200).send({status:"ok",message:'datos actualizados',dataNegocio:newResul});
           }
       })
    }
   }
   catch(err){
        res.status(400).send({status:"error", error:'error al actualizar'});
   }
}

// muestra un negocio perteneciente a un duelo
const detailNegocio =async(req,res) => {
    if(req.params.idOwner){
        try {
            const dataTienda = await Negocio.negocio.findOne({idClient:req.params.idOwner});
            console.log(dataTienda)
            res.status(200).send(dataTienda)
        } catch (error) {
            res.status(400).send({error:'Error en la busqueda de los datos de la tienda'})
        }
        
    }else{
        res.status(200).send({message: 'idOwner'})
    }
}

// muestra los datos de un negocio a partir del id la tienda
const detalNegocioClient = async(req, res)=>{
    if(req.params.idnegocio){
        var dataTienda = await Negocio.negocio.find({_id:req.params.idnegocio});
        console.log(dataTienda);
        return res.status(200).send(dataTienda)
        // var dataOwner = await Owner.user.find()
    }
    res.status(404).send({detail:"id business is require", message:"error 404, resource not found"})
}

module.exports = {
    createNegocio,
    showNegocioId,
    uploadLogo,
    uploadLocation,
    listarNegocios,
    listartNegociosForId,
    deleteNegocio,
    updateDataNegocio,
    detailNegocio,
    detalNegocioClient
}