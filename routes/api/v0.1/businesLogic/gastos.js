const { tipoGastos } = require('../../../../database/collection/models/tipoGasto');
const { gastosUser } = require('../../../../database/collection/models/gastosUser');
const { user } = require('../../../../database/collection/models/user');
const Utils = require('../../../../Utils/verifyCampos/verifyCampos');
const { negocio } = require('../../../../database/collection/models/negocio');
const { updateEstadoFinancieroGasto, getEstateFinanciero} = require('./estadoFinanciero');

class Gastos {

    static async createTipoGastos(req, res) {
        const { name, description, idNegocio } = req.body;
        //const {idNegocio} = req.params;

        var validateData = await Utils.verificacionCamposRequeridos([name, description, idNegocio]);
        if(!validateData) return res.status(206).json({status:"No fount",message:"Para crear el tipo de gasto complete los campos requerido", datosRequeridos:[{name:"name",type:"string"},{name:"description",type:"string"},{name:"idNegocio",type:"string"}]});

        const nameTipoGastos = await tipoGastos.findOne({ name });
        if (nameTipoGastos) return res.status(206).json({ status: 'No fount', message: 'El tipo de gasto ya existe' });

        const newTipo = new tipoGastos({
            name,
            description,
            idNegocio
        });
        try {
            const resp = await newTipo.save();
            return res.status(200).json({ status: 'ok', message: 'Se creo un tipo de gasto' })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }


    static async listTipoGastos(req, res) {
        try {
            const { idNegocio } = req.params;
            const resp = await tipoGastos.find({idNegocio:idNegocio});
            return res.status(200).json({
                status: 'ok',
                message: 'Lista de tipos de gastos',
                result: resp
            })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }
    
    // static async viwDetailTipoGasto(req, res){
    //     const { idTipoGasto } = req.params;

    // }


    static async updateTipoGasto(req, res) {
        const { name, description } = req.body;
        console.log(req.body,' sldkfj')
        const { idTipoGasto } = req.params
        const verifyIdTipoGasto = await validateIdTipoGasto(idTipoGasto);
        
        if (verifyIdTipoGasto.status == 'No fount') return res.status(206).json(verifyIdTipoGasto);

        const updateDatas = {
            name: name.trim() || verifyIdTipoGasto.resp.name,
            description: description || verifyIdTipoGasto.resp.description,
        };
        try {
            console.log(name.trim().toLowerCase(), '==', verifyIdTipoGasto.resp.name.trim().toLowerCase())
            if (name.trim().toLowerCase() == verifyIdTipoGasto.resp.name.trim().toLowerCase()) {
                await tipoGastos.findOneAndUpdate({ _id: idTipoGasto }, updateDatas);
                const newMenu = await tipoGastos.findOne({ _id: idTipoGasto });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actualizaron los datos',
                    result: newMenu
                });
            }
            //new RegExp('.*' + searchVariable + '.*') tipoGastos.findOne({name: /.*vasos.*/i});
            const validateName = await tipoGastos.findOne({name});
            console.log(validateName)
            if (validateName)return res.status(206).json({ status: 'No fount', message: 'Ese nombre ya en uso' });

            await tipoGastos.findOneAndUpdate({ _id: idTipoGasto }, updateDatas);
            const newTipo = await tipoGastos.findOne({ _id: idTipoGasto });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actualizaron los datos',
                result: newTipo
            });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }


    static async listGastosTipo (req,res) {

        const { idTipoGastos } = req.params;        
        const verifyidTipoGastos = await validateIdTipoGasto(idTipoGastos);
        if(verifyidTipoGastos.status === 'No fount') return res.status(206).json({status:'No fount', message:'Ese gasto no esta registrado'});
        try {
            const resp = await gastosUser.find({idTipoGastos});
            console.log(resp);
            let arr = [];
            for (var i = 0; i < resp.length; i++) {
                const user = await validateUser(resp[i].idUser)
                const responsable = await validateUser(resp[i].responsableUpdate)
                const nameTipoGasto = await validateIdTipoGasto(resp[i].idTipoGastos)
                //console.log(nameTipoGasto)
                arr.push({
                    _id: resp[i]._id,
                    idTipoGastos: nameTipoGasto.resp.name,
                    description: resp[i].description,
                    idUser: `${user.resp.name} ${user.resp.lastName}`,
                    montoGasto: resp[i].montoGasto,                    
                    responsableUpdate:`${responsable.resp.name} ${responsable.resp.lastName}`,
                    // isUpdate: resp[i].isUpdate, 
                    // dateCreate: resp[i].dateCreate,
                    // hora: resp[i].dateCreate?.toString().split(' ')[4],                 
                    // updateDate: resp[i].updateDate,
                    // horaUpdate: resp[i].updateDate?.toString().split(' ')[4],
                
                })
            }
            return res.status(200).json({
                status:'ok', message: 'lista de gastos',
                result:arr
            })
        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }



    /* ========================= gastos user ==================================== */
    static async createGastosUser(req, res) {
        
        const { idNegocio, idTipoGastos, description, montoGasto, montoAsignadoA } = req.body;
        const { idUser } = req.params;

        const stateValidateIdNegocio =await validateIdNeogocio(idNegocio);
        if(stateValidateIdNegocio.status =='No fount') return res.status(206).json({status:'No fount', message:'Gasto no registrado, idNegocio no valido o no existente'});

        if(!montoGasto || montoGasto < 0) return res.status(206).json({status:'No fount', message:'Monto no valido'});

        const dataEstadoFinanciero = await getEstateFinanciero(idNegocio);
        if(dataEstadoFinanciero.status =='No fount') return res.status(206).json({status:'No fount', message:'Gasto no registrado, estado financiero no encontrado'});
        if(dataEstadoFinanciero.montoActualDisponble < montoGasto) return res.status(206).send({status:'No fount', message:'Transaccion no realizada, monto disponible insuficiente'});

        const stateCampoVericados = await Utils.verificacionCamposRequeridos([idNegocio, idTipoGastos, description, montoGasto, montoAsignadoA]) 
        if(!stateCampoVericados) return res.status(206).send({status:'No fount', message:'Envie todos los campos resqueridos', datosRequeridos:[{name:"idNegocio",type:"string"},{name:"idTipoGastos",type:"String"}, {name:"description",type:"String"}, {name:"montoGasto",type:"Number"}, {name:"montoAsignadoA",type:"String"}]});

        const verifyUser = await validateUser(idUser);
        if (verifyUser.status == 'Not fount') return res.status(404).json(verifyUser)
        //verificamos y sacamos el id del tipo gastos para su registro con el id
        const verifiTipoGasto = await getNameTipoGastos(idTipoGastos);
        if (verifiTipoGasto.status == 'No fount') return res.status(404).json(verifiTipoGasto);

        const newUserGasto = new gastosUser({
            idTipoGastos: verifiTipoGasto.resp._id,
            description,
            montoGasto,
            montoAsignadoA,
            idUser
        });


        try {
            const resp = await newUserGasto.save();
            console.log(resp)
            await updateEstadoFinancieroGasto(idNegocio, resp._id, "gasto");

            return res.status(200).json({
                status: 'ok',
                message: 'Se creo gasto del usuario',
                result: resp
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }

    }


    static async listGastosUser(req, res) {
        const { idUser } = req.params;
        const verifyUser = await validateUser(idUser);
        if (verifyUser.status == 'No fount') return res.status(206).json(verifyUser)

        
        //console.log(await validateUser(idUser))
        try {
            const resp = await gastosUser.find({ idUser });
            let arr = [];
            for (var i = 0; i < resp.length; i++) {
                const user = await validateUser(resp[i].idUser)
                const nameTipoGasto = await validateIdTipoGasto(resp[i].idTipoGastos)
                //console.log(nameTipoGasto)
                arr.push({

                    _id: resp[i]._id,
                    idTipoGastos: nameTipoGasto.resp.name,
                    description: resp[i].description,
                    idUser: `${user.resp.name} ${user.resp.lastName}`,
                    montoGasto: resp[i].montoGasto,
                    dateCreate: resp[i].dateCreate,
                    hora: resp[i].dateCreate?.toString().split(' ')[4],
                })
            }
            return res.status(200).json({
                status: 'ok',
                message: 'Lista gastos del usuario',
                result: arr
            })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }

    static async updateGastoUser(req,res) {
        const { idTipoGastos, description, montoGasto } = req.body;
        const {idGastoUser,idUser} = req.params;// esto es el id del que se quiere actualizar

        const verifyIdUSer = await validateUser(idUser);
        if(verifyIdUSer.status == 'No fount') return res.status(206).json(verifyIdUSer); //verificamos el usuario

        const verifyGastoUser = await validateIdGastoUser(idGastoUser); // verificamos si existe este id para poder actualizar
        if(verifyGastoUser.status == 'No fount') return res.status(206).json(verifyGastoUser);
        //verificamos si ya se actualizo los datos
        if(verifyGastoUser.resp.isUpdate == true) return res.status(206).json({status:'No fount', message:'Solo se puede actualizar una ves'})

        const verifiTipoGasto = await getNameTipoGastos(idTipoGastos);//verificamos si existe este tipo de gasto en la tabla tipoGastos
        if (verifiTipoGasto.status == 'No fount') return res.status(404).json(verifiTipoGasto);

        const updateDatas = {
            idTipoGastos: verifiTipoGasto.resp._id || verifyGastoUser.resp._id,
            description: description || verifyGastoUser.resp.description,
            montoGasto:montoGasto || verifyGastoUser.resp.montoGasto,
            isUpdate:true,
            responsableUpdate: idUser // este id es del que actualizo los datos
        };  
        try {          
            await gastosUser.findOneAndUpdate({ _id: idGastoUser }, updateDatas);
            const newTipo = await gastosUser.findOne({ _id: idGastoUser });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actualizaron los datos',
                result: newTipo,
                
            });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }      
        
    }
}
//validar si el tipo de gasto existe
async function validateIdTipoGasto(idTIpoGasto) {   
    try {
        const resp = await tipoGastos.findOne({ _id: idTIpoGasto });       
        if (!resp) return { status: 'No fount', message: 'No se puede registrar por que ese tipo de gastos no fue registrado' }
        return { status: 'ok', message: 'existe', resp }
    } catch (error) {
        console.error(error);
        return { status: 'No fount', message: 'erro 400' }
    }
}
//validar si el tipo de gasto existe
async function getNameTipoGastos(idTIpoGasto) {
    try {
        const resp = await tipoGastos.findOne({ _id : idTIpoGasto });
        if (!resp) return { status: 'No fount', message: 'Registro no realizado, tipo de gasto inexistente' }
        return { status: 'ok', message: 'existe', resp }
    } catch (error) {
        console.error(error);
        return { status: 'No fount', message: 'erro 400, el campo idTipoGasto es requerido' }
    }
}


//verificar si el usuario existe
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
//validar el id del gatos user para actulizar el usuario
async function validateIdGastoUser(idGastoUser){
    try {
        const resp = await gastosUser.findOne({ _id: idGastoUser });
        if (!resp) return { status: 'No fount', message: 'No existe ese gasto del usuario' }
        return { status: 'ok', message: 'existe', resp }
    } catch (error) {
        console.error(error);
        return { status: 'No fount', message: 'erro 400' }
    }
}

async function validateIdNeogocio(idNegocio){

    try{
        const resp = await negocio.findById({_id:idNegocio});
        if(!resp) return {status:'No fount', message:'No existe ese negocio'}
        return {status:'ok', message:'existe'}
    }
    catch(error){
        console.log('error in validateIdNeogocio\n','idNegocio novalido');
        return {status:'No fount', message:'erro 400'}
    }
}


module.exports = Gastos;