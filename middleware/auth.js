'use strict'

const jwt = require('jwt-simple')


const config = require('../config/Credenciales/tokenSecret')
const token = require('../middleware/token/token')

const auth =async(req,res, next)=>{

    console.log(req.headers,'esto son los headers sds')
    // console.log(req.headers.authorization.split(' '))

    if(!req?.headers?.authorization){
        console.log('Token requerido, uds no tiene autorizacion')
        return res.status(403).send({status:403,message:'Acceso denegado, token requerido'})
    }

    
    const stateAuthorization = await token.validateToken(req, req.headers.authorization)
    if(stateAuthorization){
        next();
    }

    else{
        res.status(401).send({message:'Acceso denegado, token no valido'})
    }

}


module.exports = auth