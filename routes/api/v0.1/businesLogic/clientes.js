const { cliente } = require('../../../../database/collection/models/clientes');
const { negocio } = require('../../../../database/collection/models/negocio')
const { user } = require('../../../../database/collection/models/user')

class Clientes {

    static async create(req, res) {
        const {
            name,
            lastName,
            ci,
            country,
            city,
            phoneNumber,
            callingCode,
            homeAddress,
            description,
        } = req.body;

        const { idUser,idNegocio } = req.params;
        //validamos si el negocio existe
        const verifyNegocio = await validateNegocio(idNegocio);
        if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio)

        //validamos si el usuario existe
        const user = await validateUser(idUser)
        if (user.status == 'No fount') return res.status(206).json(user)

        const verifyDatas = await validateDatas(name, lastName, ci, phoneNumber)
        if (verifyDatas.status == 'No fount') return res.status(206).json(verifyDatas)

        const newCliente = new cliente({
            idUser,
            name,
            lastName,
            ci,
            country,
            city,
            phoneNumber,
            callingCode,
            homeAddress,
            description,
            idNegocio,
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
        const {idNegocio} = req.params;
         //validamos si el negocio existe
         const verifyNegocio = await validateNegocio(idNegocio);
         if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio)
        try {
            const resp = await cliente.find({idNegocio});
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
            if (!phoneNumber && !ci) return res.status(206).json({ status: 'No fount', message: 'No se pudo actualizar por que los datos de C.I o telefono estan vacios, inserte porlomenos 1' })

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

    static async searchCliente(req, res) {
        const { buscador } = req.body;
        const cliente = await filterCliente(buscador);
        if (cliente.status === 'No fount') return res.status(206).json(cliente);

        var pageNumber = 0;
        var pageSize = 2;
        let pag = cliente.result?.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

        return res.status(200).json({
            status: 'ok',
            message: 'lista clientes',
            result: pag
        })

    }
    static async nameCLiente(req, res) {
        const { idCliente } = req.params;
        console.log(idCliente);
        try {
            const resp = await cliente.findById({ _id: idCliente })
            if (!resp) return res.status(206).json({ status: 'No fount', message: 'Ese cliente no existe' });
            return res.status(200).json({
                status: 'ok',
                message: 'Nombre del cliente',
                result: {
                    nombre: resp.name,
                    lastName: resp.lastName,
                    ci: resp.ci,
                    phoneNumber: resp.phoneNumber
                }
            })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
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

async function filterCliente(buscador) {

    try {
        const resp = await cliente.find();
        const filter = await resp.filter((data) => {
            return data.ci?.includes(buscador)
        })

        return { status: 'ok', message: 'Clientes encontrados', result: filter }

    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'No se puede mostrar la lista filtrada' }
    }
}

//validacion del negocioF
async function validateNegocio(idNegocio) {
    try {
        const resp = await negocio.findById({ _id: idNegocio });
        if (!resp) return { status: 'No fount', message: 'NO existe ese negocio' };
        return { status: 'ok', message: 'Existe', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'Error 400', error }
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

module.exports = Clientes;