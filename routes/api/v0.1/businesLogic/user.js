'use strict'

const sha1 = require('sha1')

const User = require('../../../../database/collection/models/user')
const Token = require('../../../../middleware/token/token')
const Roles = require('../../../../database/collection/models/Roles')
const Role = require('../../../../database/collection/models/Roles')


// funccion que permite crear un nuevo usuario
const signUp =async (req,res,next) => {
    console.log(req.body)
    if(
        req.body.name == '' || req.body.name == undefined  ||
        req.body.lastName == '' || req.body.lastName == undefined  ||
        req.body.ci == '' || req.body.ci == undefined  ||
        req.body.email == '' || req.body.email == undefined  ||
        req.body.phoneNumber == '' || req.body.phoneNumber == undefined  ||
        req.body.password == '' || req.body.password == undefined  

    ){
        res.status(400).send({error:'complete los campos requeridos'});
        return null;
    }

    var newUser = new User.user({
        name           : req.body.name,
        lastName       : req.body.lastName,
        ci             : req.body.ci,
        email          : req.body.email,
        phoneNumber    : req.body.phoneNumber,
        urlPhotoAvatar : req.body.urlPhotoAvatar,
        password       : sha1(req.body.password),
        password1      : req.body.password,
    })

    newUser.role = await Roles.find({name: req.body.role===''|| req.body.role===undefined? 'user' : req.body.role})

    const exisData = await User.user.find({email:req.body.email})
    if(exisData.length>0){
        console.log('error el email ya fue registrado')
        return res.status(206).send({error:'Correo electronico existente', message:'el correo electronico ya fue registrado por otro usuario'})
    }

    newUser.save(async(err,data)=>{
        if(err){
            res.status(404).send({error:'Failed to save data', message:'Error al guardar los datos'})
            return null
        }
        
        const tokenAcces = await  Token.generateToken(data)

        res.status(200).send({
            status:'ok',
            message:'datos guardados correctamente',
            result:{
                name:data.name,
                lastName:data.lastName,
                ci: data.ci,
                email:data.email,
                phoneNumber: data.phoneNumber,
                urlPhotoAvatar: data.urlPhotoAvatar,
            },
            tokenAcces
        })
    })


}


const signIn =async (req, res, next) =>{
    console.log(req.body)

    var dataUser =await  User.user.find({email:req.body.email, password1:req.body.password }).populate("role")
    console.log(dataUser)
    if(dataUser.length===1 && dataUser[0].email === req.body.email && dataUser[0].password1 === req.body.password && dataUser[0].state===true){
        var token = await Token.generateToken(dataUser[0])
        return res.status(200).send({
            status:'ok',
            result: {
                _id:dataUser[0]._id,
                name:dataUser[0].name,
                lastName:dataUser[0].lastName,
                ci:dataUser[0].ci,
                email:dataUser[0].email,
                phoneNumber: dataUser[0].phoneNumber,
                role:dataUser[0].role,
                state:dataUser[0].state
            },
            token
        })
    }

    if(dataUser.length===1 && dataUser[0].email === req.body.email && dataUser[0].password1 === req.body.password && dataUser[0].state===false){
        return res.status(206).send({
            status:'error',
            message:'Usuario inactivo'
        })
        
    }
    
    return res.status(401).send({
        status: 'No fount',
        message:'Error en la contraseña o email, usuairio no existente'
    })
}

// muestra los datos de los usuarios activos
const showListUser = async (req, res, next)=>{
    
    const stateUser = await req?.params?.state;
    console.log(stateUser)

    // try{
        switch (stateUser) {
            case "active":
                var listUser = await User.user.find({state:true});
                return res.status(200).send({status:'ok', result:listUser});

            case "inactive":
                var listUser = await User.user.find({state:false});
                return res.status(200).send({status:'ok', result:listUser});

            case "all":

                var listUser = await User.user.find({}).populate("role")
                // return res.status(200).send({status:'ok', result:listUser});


                var listUserfilter =await  listUser.map((user,i)=>({
                    '_id':user._id, 
                    'name':user.name, 
                    "lastName":user.lastName, 
                    "ci":user.ci, 
                    "email":user.email, 
                    "phoneNumber":user.phoneNumber, 
                    "state":user.state,
                    "roles": user.role
                }))

                return res.status(200).send({status:'ok', totalResults:listUser?.length, result:listUserfilter});

            default:
                return res.status(400).send({status:'error', message:'state no valido'});
                
        }
        
//     }catch(error){
//         return res.status(404).send({status:404, error:'Error en la peticion'})
//     }
}



// async function returnRorlesUser(user){
//     console.log(user)
//     var rolesUser = await Roles.find({$in:user.role})
//     console.log(rolesUser)  
//     return rolesUser;
// }


const editDataUser = async (req, res, nuxt) =>{

    const {idUser, name, lastName, ci, email, phoneNumber, password, state, oldRole, newRole } = req.body


    var dataUser = await User.user.findById({_id: idUser})

    console.log(dataUser)
    const newDataUser = await{ 
        name: name!='' && name? name:dataUser.name,
        lastName: lastName!='' && lastName? lastName:dataUser.lastName,
        ci: ci!='' && ci? ci:dataUser.ci,
        email: email!='' && email? email:dataUser.email,
        phoneNumber: phoneNumber!='' && phoneNumber? phoneNumber:dataUser.phoneNumber,
        state: state!='' && state? state:dataUser.state,
        password: password !='' && password ? password : dataUser.password,
        
    }

    if(newRole!='' && newRole && oldRole!='' && oldRole){
        var verifyNewRole = await Roles.findOne({name:newRole})
        var verfyOldRole = await Roles.findOne({name:oldRole})

        var newRoles = await dataUser.role.remove(verfyOldRole._id)
        if(!dataUser.role.includes(verifyNewRole._id)){
            await newRoles.push(verifyNewRole._id)
        }
        // await dataUser.role.push(newRoles);
        newDataUser.role = await  newRoles;
        console.log('-------------------')
        console.log(verifyNewRole, verfyOldRole, newRoles)
      
    }

    var userDataUpdate = await User.user.findOneAndUpdate({_id:dataUser._id}, newDataUser);
    var datatUpdate = await User.user.findById({_id:dataUser._id}).populate('role')
    res.status(200).json(datatUpdate)

    
}

// Agregar un nuevo role 
const addNewRole = async (req, res, next) =>{

    try{
        const {idUser, newRole} = req.body;
        if(idUser =='' || !idUser && newRole =='' || !newRole){
            return res.status(400).send({status:404, error:"Los datos de idUser y rol son requeridos"})
        }
        
        var userData = await User.user.findById({_id:idUser});
        if(!userData) return res.status(401).send({"status":401, 'error':'id de usuario invalido'});
        
        var roleVerify = await Roles.findOne({name:newRole})
        if(!roleVerify) return res.status(401).send({'status':401, 'error':'El rol que intenta agregar no es valido'});
        
        if(userData.role.includes(roleVerify._id)){
            var updateData=await User.user.findById({_id:userData._id}).populate('role');
            return res.status(200).send({status:'ok', message:'Nuevo rol agregado',updateData})
        }
        userData.role.push(roleVerify)
        await User.user.findByIdAndUpdate({_id:userData._id},{role:userData.role})
        var updateData=await User.user.findById({_id:userData._id}).populate('role');
        return res.status(200).send({status:'ok', message:'Nuevo rol agregado',updateData})
    }
    catch(error){
        console.log('error in function addNewRole')
        return res.status(404).send({status:404, error: 'error no se puede actualizar el nuevo rol, revise el id que introdujo'})
    }
}

// Remover un rol de un usuario
const removeRoleUser = async (req, res, next)=>{
    try{
        const {idUser, currentRole} = req.body;
        if(idUser =='' || !idUser && currentRole =='' || !currentRole){
            return res.status(400).send({status:404, error:"Los datos de idUser y rol son requeridos"})
        }
        
        var userData = await User.user.findById({_id:idUser});
        if(!userData) return res.status(401).send({"status":401, 'error':'id de usuario invalido'});
        
        var roleVerify = await Roles.findOne({name:currentRole})
        if(!roleVerify) return res.status(401).send({'status':401, 'error':'El rol que intenta remover no es valido'});
        
        if(!userData.role.includes(roleVerify._id) && userData.role.length > 1){
            var updateData=await User.user.findById({_id:userData._id}).populate('role');
            return res.status(200).send({status:'ok', message:'El rol fue removido',updateData})
        }

        userData.role.remove(roleVerify._id)
        console.log(userData.role.length);
        if(userData.role){
            var roleDefault = await Roles.findOne({name:'user'});
            console.log(roleDefault)
            userData.role = roleDefault._id
        } 
        
        await User.user.findByIdAndUpdate({_id:userData._id},{role:userData.role})
        var updateData=await User.user.findById({_id:userData._id}).populate('role');
        return res.status(200).send({status:'ok', message:'El role fue removido',updateData})
    }
    catch(error){
        console.log('error in function addNewRole')
        return res.status(404).send({status:404, error: 'error no se puede remover el rol, revise el id que introdujo'})
    }
}



module.exports = {
    signUp,
    signIn,
    showListUser,
    editDataUser,
    addNewRole,
    removeRoleUser
}