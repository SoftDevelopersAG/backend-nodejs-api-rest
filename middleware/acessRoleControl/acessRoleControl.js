'use strict'
const User = require('../../database/collection/models/user')
const Roles = require('../../database/collection/models/Roles');

// funcion que verifica la existencia de un usuario y su rol a partir del Token
const isAdmin = async (req, res, next) => {
    console.log('acces role control')
    findAccesRole('admin', req, res, next)
    
}

const isUser = async (req, res, next) => {
    console.log('acces role control')
    findAccesRole('user', req, res, next)
}
const isCajero = async (req, res, next) => {
    console.log('acces role control')
    findAccesRole('caja', req, res, next)
}
const isCocinero = async (req, res, next) => {
    console.log('acces role control')
    findAccesRole('cocinero', req, res, next)
}





const findAccesRole = async (ROLE, req, res, next)=>{

    const dataUser = await User.user.findById({_id:req.idUser})
    if(!dataUser)return res.status(404).send({state:404,error:'Usuario no existente'})
    if(!dataUser.state) return res.status(404).send({state:404,message:'Usuario no activo'})
    console.log(dataUser)
    const listRolesUser = await dataUser.role;
    console.log(listRolesUser)

    const roles = await Roles.find({_id: {$in: listRolesUser}})
    console.log(roles, ' ----------------------*-*-*-*')

    const existRole = await roles.map(nameRole=>nameRole.name === ROLE)
    const existeRoleAdmin = await roles.map(nameRole=>nameRole.name === 'admin')

    if(dataUser){

        if(existRole.includes(true) || existeRoleAdmin.includes(true)){
            next()
        }else{
            res.status(403).json({
                status:403,
                message: 'Acceso denegado, permiso insuficiente'
            })
        }
    }
}


module.exports={
    isAdmin,
    isUser,
    isCajero,
    isCocinero
}

