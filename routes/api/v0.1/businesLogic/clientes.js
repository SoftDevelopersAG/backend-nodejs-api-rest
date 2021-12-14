const { cliente } = require('../../../../database/collection/models/clientes');

class Clientes {
    static async create(req, res) {
        const { name, lastName, ci, phoneNumber, description } = req.body;
        const { idUser } = req.params;
        const verifyDatas = await validateDatas(name, lastName, ci, phoneNumber)
        if (verifyDatas.status == 'No fount') return res.status(206).json(verifyDatas)
        const newCliente = new cliente({
            name,
            lastName,
            ci,
            phoneNumber,
            description,
            idUser
        });
        try {
            const resp = await newCliente.save();
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
            const resp = await cliente.find();
            res.status(200).json({
                status: 'ok',
                message: 'Lista de clientes',
                result: resp
            })
        } catch (error) {
            console.error(error)
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
    static async update(req, res) {
        const { name, lastName, ci, phoneNumber, description } = req.body;
        const { idCliente } = req.params;
        console.log(req.body, ' slkdfjsldkfj')
        const verifyCLiente = await validateIdCliente(idCliente);
        if (verifyCLiente.status === 'No fount') return res.status(206).json(verifyCLiente);

        const updateDatas = await {
            name: name || verifyCLiente.resp.name,
            lastName: lastName || verifyCLiente.resp.lastName,
            ci: ci ? ci : null,
            phoneNumber: phoneNumber ? phoneNumber : null,
            description: description || verifyCLiente.resp.description,
        }

        try {
            if(!phoneNumber && !ci) return res.status(206).json({ status: 'No fount', message:'No se pudo actualizar por que los datos de C.I o telefono estan vacios, inserte porlomenos 1'})
           
            if (updateDatas.ci == verifyCLiente.resp.ci && updateDatas.phoneNumber == verifyCLiente.resp.phoneNumber) {
                await cliente.findOneAndUpdate({ _id: idCliente }, updateDatas);
                const newMenu = await cliente.findOne({ _id: idCliente });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actulizo los datos del cliente',
                    result: newMenu
                });
            }
            if (updateDatas.ci != verifyCLiente.resp.ci) {
                if (ci) {
                    const verifyCi = await cliente.findOne({ ci });
                    if (verifyCi) return res.status(206).json({ status: 'No fount', message: 'C.I. ya en uso' });
                }
                await cliente.findOneAndUpdate({ _id: idCliente }, updateDatas);
                const newMenu = await cliente.findOne({ _id: idCliente });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actulizo los datos del cliente',
                    result: newMenu
                });
            }          
            if (updateDatas.phoneNumber != verifyCLiente.resp.phoneNumber) {                
                if (phoneNumber) {
                    const verifyPhone = await cliente.findOne({ phoneNumber })                  
                    if (verifyPhone) return res.status(206).json({ status: 'No fount', message: 'Telefono ya en uso' })
                }
                await cliente.findOneAndUpdate({ _id: idCliente }, updateDatas);
                const newMenu = await cliente.findOne({ _id: idCliente });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actulizo los datos del cliente',
                    result: newMenu
                });
            }
            
            await cliente.findOneAndUpdate({ _id: idCliente }, updateDatas);
            const newMenu = await cliente.findOne({ _id: idCliente });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actulizo los datos del cliente',
                result: newMenu
            });

        } catch (error) {
            console.error(error)
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
}

async function validateDatas(name, lastName, ci, phoneNumber) {
    if (!name) return { status: 'No fount', message: 'Nombre del cliente es obligatorio' };
    if (!lastName) return { status: 'No fount', message: 'Apellido del cliente es obligatorio' };
    if (!ci && !phoneNumber) return { status: 'No fount', message: 'Inserte telefono o ci' };

    if (ci) {
        const verifyCi = await cliente.findOne({ ci });
        if (verifyCi) return { status: 'No fount', message: 'C.I. ya en uso' }
    }
    if (phoneNumber) {
        const verifyPhone = await cliente.findOne({ phoneNumber })
        if (verifyPhone) return { status: 'No fount', message: 'Telefono ya en uso' }
    }
    return { status: 'ok' }

}
async function validateIdCliente(idCliente) {
    try {
        const resp = await cliente.findOne({ _id: idCliente });
        if (!resp) return { status: 'No fount', message: 'Ese cliente no existe sdf' }
        return { status: 'ok', message: 'cliente existe', resp }
    } catch (error) {
        console.error(erro);
        return { status: 'No fount' }
    }
}

module.exports = Clientes;