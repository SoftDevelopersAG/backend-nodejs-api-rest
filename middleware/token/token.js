const jwt = require('jwt-simple');
const moment  = require('moment');


const config = require('../../config/Credenciales/tokenSecret');



const generateToken =async (dataUser={})=>{
    if(dataUser._id != ''){

        var payload = {
            id: dataUser._id, 
            email:dataUser.email,
            init : moment().format('LLL'),
            end: moment().add(1,'day').format('LLL'),
            expira: moment().add(1,'day').unix(),
            timeLife: moment().add(1,'day').unix() - moment().unix()
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

//generate token de prueva
const generateLicenceToken =async (data={}, time)=>{
    console.log(time,'esto es ddddd')
    let timeExp = {num:59, time:'seconds'}
    if(time == 'day') timeExp = {num:1, time:'day'}
    if(time == 'month') timeExp = {num:1, time:'month'}
    if(time == 'year') timeExp = {num:1, time:'year'}

    if(data){

        var payload = {
            id: data._id, 
            cliente:data.cliente,
            telefono:data.telefono,
            init : moment().format('LLL'),
            end: moment().add(timeExp.num, timeExp.time).format('LLL'),
            expira: moment().add(timeExp.num, timeExp.time).unix(),
            timeLife: moment().add(timeExp.num, timeExp.time).unix() - moment().unix()
        };

        var token =await jwt.encode( payload, config.SECRET_TOKEN )

        console.log(payload)
        console.log(token)  
        return token;
    }

    console.log('Error al generar el token')
}
const validateLicence= async(req, token = '') => {

    console.log(token)
    if(token === ''){
        console.log('error lisence debe ser difrente de vacio o undefined')
        return null
    } 

    try {
        const dataDecode = await jwt.decode(token, config.SECRET_TOKEN)
        console.log(dataDecode)
        if(dataDecode.expira - moment().unix() > 0){
            console.log('lisence vigente, acceso permitido');
            console.log(dataDecode.expira -  moment().unix())

            req.idUser = dataDecode.id;

            return true
        }
        if(dataDecode.expira - moment().unix() < 0){
            console.log('lisence no valido, acceso denegado');
            console.log(dataDecode.expira -  moment().unix())

            return false;
        }
    } catch (error) {
        console.log(`Algo salio mal en la verificaion de la lisecia`)
        return false;
    }
}

module.exports = {
    generateToken,
    validateToken,
    generateLicenceToken,
    validateLicence
}