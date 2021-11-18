'use strict'

const Role = require("../models/Roles")
const ListRoles = require('../../../config/roles')


// lista roles en la base de datos
const roles = ListRoles.listRoles

// funcion que crea los roles en el primer inicio de la aplicacion
const creatRoles = async ()=>{

    try {
        const count = await Role.estimatedDocumentCount({})
        if(count > 0) return;

        const values = await Promise.all([
            roles.map((role=>new Role({name: role}).save()))
        ])
        console.log('los roles fueron creados')
    } catch (error) {
        console.log('error el guaradar los roles en la primera inicio de la api-rest', error)
    }
}


module.exports = creatRoles