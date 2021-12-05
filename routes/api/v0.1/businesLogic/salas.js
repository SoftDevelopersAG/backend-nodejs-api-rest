
const { salas } = require("../../../../database/collection/models/salas");

//que el rol de admin cajero y mesero puedan ver esto
class SalasRoutes {
    static async create(req, res) {
        //constroles que tiene que tener
        //id de usuario que exista  nombres no repetidos
        const { nameSala, numberMesas, numberClientes } = req.body;
        console.log(req.body,'esto es salas')
        const { idUser } = req.params;

        const newSala = new salas({
            nameSala,
            numberMesas,
            numberClientes,
            idUser,
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
        try {
            const listSalas = await salas.find().sort( { nameSala: 1 } );
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

module.exports = SalasRoutes;