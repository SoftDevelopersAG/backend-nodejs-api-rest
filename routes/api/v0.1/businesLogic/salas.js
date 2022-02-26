
const { salas } = require("../../../../database/collection/models/salas");
const {negocio} = require("../../../../database/collection/models/negocio");
const {user} = require("../../../../database/collection/models/user");
//que el rol de admin cajero y mesero puedan ver esto
class SalasRoutes {
    static async create(req, res) {
        //constroles que tiene que tener
        //id de usuario que exista  nombres no repetidos
        const { nameSala, numberMesas, numberClientes } = req.body;
        const { idUser,idNegocio } = req.params;        
        const stateValidateIdNegocio = await validateIdNeogocio(idNegocio);        
        if (stateValidateIdNegocio.status == 'No fount') return res.status(206).json(stateValidateIdNegocio);
        const verifyUser = await validateUser(idUser);
        if (verifyUser.status == 'No fount') return res.status(206).json(verifyUser)

        const newSala = new salas({
            nameSala,
            numberMesas,
            numberClientes,
            idUser,
            idNegocio
        });
        try {
            const resp = await newSala.save();            
            return res.status(200).json({
                status: 'ok',
                message: 'Datos guardados correctamente',
                result: resp
            })
        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }

    }
    static async list(req, res) {
        const {idNegocio} = req.params;
        try {
            const listSalas = await salas.find({idNegocio}).sort( { nameSala: 1 } );
            const arr = await listSalas.map((data) => ({
                id: data._id,
                nameSala: data.nameSala,
                numberMesas: data.numberMesas,
                numberClientes: data.numberClientes,
            }))
            return res.status(200).send({
                status: 'ok',
                message:'Lista de salas',
                result: arr
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
}

async function validateIdNeogocio(idNegocio) {

    try {
        const resp = await negocio.findById({ _id: idNegocio });
        if (!resp) return { status: 'No fount', message: 'No existe ese negocio' }
        return { status: 'ok', message: 'existe' }
    }
    catch (error) {
        console.log('error in validateIdNeogocio\n', 'idNegocio novalido');
        return { status: 'No fount', message: 'erro 400' }
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

module.exports = SalasRoutes;