const jwt = require('jwt-simple');
const moment  = require('moment');


const config = require('../../config/Credenciales/tokenSecret');



const generateToken =async (dataUser={})=>{
    if(dataUser._id != ''){

        var payload = {
            id: dataUser._id, 
            email:dataUser.email,
            init : moment().format('LLL'),
            end: moment().add(14,'day').format('LLL'),
            expira: moment().add(14,'day').unix(),
            timeLife: moment().add(14,'day').unix() - moment().unix()
        };

        var token =await jwt.encode( payload, config.SECRET_TOKEN )

        console.log(payload)
        console.log(token)  
        return token;
    }

    console.log('Error al generar el token')
}



const validateToken= async(req, token = '') => {

    console.log(token)
    if(token === ''){
        console.log('error token debe ser difrente de vacio o undefined')
        return null
    } 

    try {
        const dataDecode = await jwt.decode(token, config.SECRET_TOKEN)
        console.log(dataDecode)
        if(dataDecode.expira - moment().unix() > 0){
            console.log('token vigente, acceso permitido');
            console.log(dataDecode.expira -  moment().unix())

            req.idUser = dataDecode.id;

            return true
        }
        if(dataDecode.expira - moment().unix() < 0){
            console.log('token no valido, acceso denegado');
            console.log(dataDecode.expira -  moment().unix())

            return false;
        }
    } catch (error) {
        console.log(`Algo salio mal en la verificaion del token, verifica token secret, o el token es incorrecto`)
        return false;
    }
}

module.exports = {
    generateToken,
    validateToken
}