const { tipoGastos } = require('../../../../database/collection/models/tipoGasto');

class Gastos {
    static async createTipoGastos(req, res) {
        const { name, description } = req.body;
        //const {idNegocio} = req.params;
        //todavia no se tiene id de negocio definido en el disenio
        const nameTipoGastos = await tipoGastos.findOne({ name });
        if (nameTipoGastos) return res.status(206).json({ status: 'No fount', message: 'Ese nombre ya esta en uso' });

        const newTipo = new tipoGastos({
            name,
            description,
            idNegocio: 'esto falta mandar desde frontEnd'
        });
        try {
            const resp = await newTipo.save();
            return resp.json({ status: 'ok', message: 'Se creo un tipo de gasto' })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }
    static async listTipoGastos(req, res) {
        try {
            const resp = await tipoGastos.find();
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
    static async updateTipoGasto(req, res) {
        const { name, description } = req.body;
        const { idTipoGasto } = req.params
        const verifyIdTipoGasto = await validateIdTipoGasto(idTipoGasto);
        if (verifyIdTipoGasto.status == 'No fount') return res.status(206).json(verifyIdTipoGasto);

        const updateDatas = {
            name: name || verifyIdTipoGasto.name,
            description: description || verifyIdTipoGasto.description,
        };
        try {
            if (name == verifyIdTipoGasto.name) {
                await tipoGastos.findOneAndUpdate({ _id: idTipoGasto }, updateDatas);
                const newMenu = await menu.findOne({ _id: idTipoGasto });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actulizo el menu',
                    result: newMenu
                });
            }
            const validateName = await tipoGastos.findOne({name});
            if(validateName) return res.status(206).json({ status: 'No fount', message: 'Ese nombre ya en uso'});

            await tipoGastos.findOneAndUpdate({ _id: idTipoGasto }, updateDatas);
            const newTipo = await menu.findOne({ _id: idTipoGasto });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actulizo el menu',
                result: newTipo
            });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }
}

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

export default Gastos;