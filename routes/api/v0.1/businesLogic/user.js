'use strict'

const sha1 = require('sha1')

const User = require('../../../../database/collection/models/user')
const Token = require('../../../../middleware/token/token')
const Roles = require('../../../../database/collection/models/Roles')
const Role = require('../../../../database/collection/models/Roles')
const { negocio } = require('../../../../database/collection/models/negocio');

const validateNegocio = async (idNegocio) => {
    try {
        const resp = await negocio.findById({ _id: idNegocio });
        if (!resp) return { status: 'No fount', message: 'Ese negocio no existe' };
        return { status: 'ok', message: 'Existe', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: "error 400" }
    }
}

//register user admin
const registerAdmin = async (req, res) => {
    const {
        name,
        lastName,
        ci,
        email,
        phoneNumber,
        password,
        password1,
    } = req.body

    if (
        name == '' || name == undefined ||
        lastName == '' || lastName == undefined ||
        ci == '' || ci == undefined ||
        email == '' || email == undefined ||
        phoneNumber == '' || phoneNumber == undefined ||
        password == '' || password == undefined ||
        password1 == '' || password1 == undefined

    ) {
        res.status(400).send({ status: 'No fount', message: 'Complete los campos requeridos' });
        return;
    }
    if (password != password1) {
        res.status(206).send({
            status: 'No fount',
            error: 'Las contracenias no son iguales',
            message: 'Las contraceñas no coninciden'
        })
        return;
    }
    const newUser = new User.user({
        name: name,
        lastName: lastName,
        ci: ci,
        email: email,
        phoneNumber: phoneNumber,
        direction: '',
        urlPhotoAvatar: '',
        password: sha1(password),
        password1: password,
    })
    newUser.role = await Roles.find({ name: 'admin' })
    const existEmail = await User.user.find({ email });
    const existCI = await User.user.find({ ci });

    if (existEmail.length > 0) {
        return res.status(206).send({
            status: 'No fount',
            error: 'Correo electronico existente',
            message: 'el correo electronico ya fue registrado por otro usuario'
        })
    }
    if (existCI.length > 0) {
        return res.status(206).send({
            status: 'No fount',
            error: 'C.I. existenete',
            message: 'C.I. ya esta en uso'
        })
    }
    newUser.save(async (err, data) => {
        if (err) {
            res.status(404).send({
                status: 'No fount',
                error: 'Failed to save data',
                message: 'Error al guardar los datos'
            })
            return null
        }

        const tokenAcces = await Token.generateToken(data);

        res.status(200).send({
            status: 'ok',
            message: 'Datos guardados correctamente',
            result: data,
            tokenAcces
        })
    })
}
//verificar ci telefono y email
const verifiDatasUser = async (req, res) => {
    const { ci, phoneNumber, email } = req.body;
    try {
        const resp = await User.user.find({ $or: [{ ci }, { phoneNumber }, { email }] }).populate("role");
        if (resp.length > 0) {
            let obj = {}
            await resp.map((data) => {
                if (data.ci == ci) {
                    obj['ci'] = 'CI ya esta en uso';

                }
                if (data.email == email) {
                    obj['email'] = 'Email ya esta en uso'

                }
                /* if (data.phoneNumber == phoneNumber) {
                    obj['phoneNumber'] = 'Telfono ya esta en uso';
                    
                } */
            })
            return res.status(206).json({ status: 'No fount', message: obj })
        }
        return res.status(200).json({ status: 'ok', message: 'continuar' })
    } catch (error) {
        console.log(error)
        return res.status(206).json({ status: 'No fount', message: 'error 400' })
    }
}
// funccion que permite crear un nuevo usuario
const signUp = async (req, res, next) => {
    const { name, lastName, ci, email, phoneNumber, direction, urlPhotoAvatar, password, password1, role } = req.body;
    const { idNegocio } = req.params;
    console.log(idNegocio, ' =============================================================================')
    const verifyNegocio = await validateNegocio(idNegocio);
    if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);

    if (
        name == '' || name == undefined ||
        lastName == '' || lastName == undefined ||
        ci == '' || ci == undefined ||
        email == '' || email == undefined ||
        phoneNumber == '' || phoneNumber == undefined ||
        direction == '' || direction == undefined ||
        password == '' || password == undefined ||
        password1 == '' || password1 == undefined

    ) {
        res.status(400).send({ status: 'No fount', message: 'complete los campos requeridos', error: 'complete los campos requeridos' });
        return null;
    }
    if (password != password1) {
        res.status(206).send({
            status: 'No fount',
            error: 'Las contracenias no son iguales',
            message: 'Las contraceñas no coninciden'
        })
        return null;
    }

    const newUser = new User.user({
        name: name,
        lastName: lastName,
        ci: ci,
        email: email,
        phoneNumber: phoneNumber,
        direction: direction,
        urlPhotoAvatar: urlPhotoAvatar,
        password: sha1(req.body.password),
        password1: password,
        idNegocio: idNegocio
    })

    newUser.role = await Roles.find({ name: role === '' || role === undefined ? 'user' : role });

    const existEmail = await User.user.find({ email });
    const existCI = await User.user.find({ ci });

    if (existEmail.length > 0) {
        return res.status(206).send({
            status: 'No fount',
            error: 'Correo electronico existente',
            message: 'el correo electronico ya fue registrado por otro usuario'
        })
    }
    if (existCI.length > 0) {
        return res.status(206).send({
            status: 'No fount',
            error: 'C.I. existenete',
            message: 'C.I. ya esta en uso'
        })
    }

    newUser.save(async (err, data) => {
        if (err) {
            res.status(404).send({
                status: 'No fount',
                error: 'Failed to save data',
                message: 'Error al guardar los datos'
            })
            return null
        }

        const tokenAcces = await Token.generateToken(data);

        res.status(200).send({
            status: 'ok',
            message: 'Datos guardados correctamente',
            result: {
                name: data.name,
                lastName: data.lastName,
                ci: data.ci,
                email: data.email,
                phoneNumber: data.phoneNumber,
                direction: data.direction,
                urlPhotoAvatar: data.urlPhotoAvatar,
            },
            tokenAcces
        })
    })


}
const signIn = async (req, res, next) => {
    const dataUser = await User.user.find({ email: req.body.email, password1: req.body.password }).populate("role");

    console.log(dataUser)
    if (dataUser.length === 1 && dataUser[0].email === req.body.email && dataUser[0].password1 === req.body.password && dataUser[0].state === true) {

        const token = await Token.generateToken(dataUser[0])
        return res.status(200).send({
            status: 'ok',
            result: {
                id: dataUser[0]._id,
                name: dataUser[0].name,
                lastName: dataUser[0].lastName,
                ci: dataUser[0].ci,
                email: dataUser[0].email,
                phoneNumber: dataUser[0].phoneNumber,
                role: dataUser[0].role,
                state: dataUser[0].state,
                idNegocio: dataUser[0].idNegocio
            },
            token
        })
    }

    if (dataUser.length === 1 && dataUser[0].email === req.body.email && dataUser[0].password1 === req.body.password && dataUser[0].state === false) {
        return res.status(206).send({
            status: 'No fount',
            message: 'Usuario inactivo'
        })

    }

    return res.status(206).send({
        status: 'No fount',
        message: 'Error en la contraseña o email, usuairio no existente'
    })
}
// muestra los datos de los usuarios activos
const showListUser = async (req, res, next) => {

    const stateUser = await req?.params?.state;
    const { idNegocio } = req.params;
    // try{
    switch (stateUser) {
        case "active":
            var listUser = await User.user.find({ state: true }).populate("role");
            return res.status(200).send({ status: 'ok', result: listUser });

        case "inactive":
            var listUser = await User.user.find({ state: false });
            return res.status(200).send({ status: 'ok', result: listUser });

        case "all":

            var listUser = await User.user.find({ idNegocio }).populate("role")
            // return res.status(200).send({status:'ok', result:listUser});


            var listUserfilter = await listUser.map((user, i) => ({
                '_id': user._id,
                'name': user.name,
                "lastName": user.lastName,
                "ci": user.ci,
                "email": user.email,
                "phoneNumber": user.phoneNumber,
                "direction": user.direction,
                "state": user.state,
                "roles": user.role
            }))

            return res.status(200).send({ status: 'ok', totalResults: listUser?.length, result: listUserfilter });

        default:
            return res.status(400).send({ status: 'error', message: 'state no valido' });

    }

    //     }catch(error){
    //         return res.status(404).send({status:404, error:'Error en la peticion'})
    //     }
}



// async function returnRorlesUser(user){
//     console.log(user)
//     var rolesUser = await Roles.find({$in:user.role})
//     console.log(rolesUser)  
//     return rolesUser;
// }


const editDataUser = async (req, res, nuxt) => {

    const { idUser, name, lastName, ci, email, phoneNumber, password, state, oldRole, newRole } = req.body


    var dataUser = await User.user.findById({ _id: idUser })

    const newDataUser = await {
        name: name != '' && name ? name : dataUser.name,
        lastName: lastName != '' && lastName ? lastName : dataUser.lastName,
        ci: ci != '' && ci ? ci : dataUser.ci,
        email: email != '' && email ? email : dataUser.email,
        phoneNumber: phoneNumber != '' && phoneNumber ? phoneNumber : dataUser.phoneNumber,
        state: state != '' && state ? state : dataUser.state,
        password: password != '' && password ? password : dataUser.password,

    }

    if (newRole != '' && newRole && oldRole != '' && oldRole) {
        var verifyNewRole = await Roles.findOne({ name: newRole })
        var verfyOldRole = await Roles.findOne({ name: oldRole })

        var newRoles = await dataUser.role.remove(verfyOldRole._id)
        if (!dataUser.role.includes(verifyNewRole._id)) {
            await newRoles.push(verifyNewRole._id)
        }
        // await dataUser.role.push(newRoles);
        newDataUser.role = await newRoles;
    }

    var userDataUpdate = await User.user.findOneAndUpdate({ _id: dataUser._id }, newDataUser);
    var datatUpdate = await User.user.findById({ _id: dataUser._id }).populate('role')
    res.status(200).json(datatUpdate)


}
//actulizar datos personales
const editPersonalData = async (req, res) => {
    const { name, lastName, direction, ci, email, phoneNumber, role, password, password1 } = req.body;
    const { idUser } = req.params;
    //verficar si existe el usuario
    const verifyUser = await verifyIdUser(idUser);
    const { success, dataUser } = verifyUser;
    if (success == false) return res.status(206).json({ status: 'No fount', error: 'Id incorrecto', message: verifyUser.message })

    //validamos los datos
    const verifyDatas = await validateDatas(ci, email, phoneNumber, role, password, password1, idUser);

    if (verifyDatas.success == false) {
        return res.status(206).json({
            status: 'No fount',
            error: 'No se puede actualizar los datos',
            message: verifyDatas.message
        })
    }
    const updateDatas = await {
        name: name || dataUser.name,
        lastName: lastName || dataUser.lastName,
        direction: direction || dataUser.direction,
        ci: ci || dataUser.ci,
        email: email || dataUser.email,
        phoneNumber: phoneNumber || dataUser.phoneNumber,
        password: password ? sha1(password) : dataUser.password,
        password1: password1 || dataUser.password1,
    };

    try {
        await User.user.findOneAndUpdate({ _id: idUser }, updateDatas);
        const datas = await User.user.findById({ _id: idUser }).populate('role');
        res.status(200).json({
            status: 'ok',
            message: 'Se actualizo los datos',
            result: datas
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: 'No fount', error })
    }

}
// Agregar un nuevo role 
const addNewRole = async (req, res, next) => {

    try {
        const { role } = req.body;
        const { idUser } = req.params;

        if (idUser == '' || !idUser && role == '' || !role) {
            return res.status(400).send({ status: 404, error: "Los datos de idUser y rol son requeridos" })
        }
        var userData = await User.user.findById({ _id: idUser });
        if (!userData) return res.status(206).send({ status: 'No fount', message: 'id de usuario invalido' });

        var roleVerify = await Roles.findOne({ name: role })
        if (!roleVerify) return res.status(206).send({ status: 'No fount', message: 'El rol que intenta agregar no es valido' });

        if (userData.role.includes(roleVerify._id)) {
            var updateData = await User.user.findById({ _id: userData._id }).populate('role');
            return res.status(200).send({ status: 'ok', message: 'Nuevo rol agregado', updateData })
        }
        userData.role.push(roleVerify)
        await User.user.findByIdAndUpdate({ _id: userData._id }, { role: userData.role })
        var updateData = await User.user.findById({ _id: userData._id }).populate('role');
        return res.status(200).send({ status: 'ok', message: 'Nuevo rol agregado', updateData })
    }
    catch (error) {
        return res.status(404).send({ status: 404, error: 'error no se puede actualizar el nuevo rol, revise el id que introdujo' })
    }
}
// Remover un rol de un usuario
const removeRoleUser = async (req, res, next) => {
    try {
        const { idUser, currentRole } = req.body;
        if (idUser == '' || !idUser && currentRole == '' || !currentRole) {
            return res.status(400).send({ status: 404, error: "Los datos de idUser y rol son requeridos" })
        }

        var userData = await User.user.findById({ _id: idUser });
        if (!userData) return res.status(206).send({ status: 'No fount', message: 'id de usuario invalido' });

        var roleVerify = await Roles.findOne({ name: currentRole })
        if (!roleVerify) return res.status(206).send({ status: 'No fount', message: 'El rol que intenta remover no es valido' });

        if (!userData.role.includes(roleVerify._id) && userData.role.length > 1) {
            var updateData = await User.user.findById({ _id: userData._id }).populate('role');
            return res.status(200).send({ status: 'ok', message: 'El rol fue removido', updateData })
        }

        if (currentRole == 'user') return res.status(206).json({
            status: 'No fount',
            message: 'Ese rol no se puede eliminar'
        })

        userData.role.remove(roleVerify._id)
        if (userData.role.length === 0) {
            var roleDefault = await Roles.findOne({ name: 'user' });

            userData.role = roleDefault._id
        }

        await User.user.findByIdAndUpdate({ _id: userData._id }, { role: userData.role })
        var updateData = await User.user.findById({ _id: userData._id }).populate('role');
        return res.status(200).send({ status: 'ok', message: 'El role fue removido', updateData })
    }
    catch (error) {
        console.log('error in function addNewRole')
        return res.status(404).send({ status: 404, error: 'error no se puede remover el rol, revise el id que introdujo' })
    }
}
//lista de usuarios cajeros activos 

const getlistUserActivos = async (req, res) => {
    const { idNegocio } = req.params;
    const verifyNegocio = await validateNegocio(idNegocio);
    if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);
    try {
        const resp = await User.user.find({ state: true }).populate('role');
        if (!resp) return res.status(206).json({ status: 'Not Found', message: 'Ese usuario no existe' });

        let arr = []
        await resp.map((data) => {
            for (let i = 0; i < data.role.length; i++) {
                console.log(data.role[i].name)
                if (data.role[i].name == 'caja' || data.role[i].name == 'admin') {
                    arr.push(data)
                }
            }

        })
        //>>> para quitar los repetidos del arr
        let obj = {}
        for (let d = 0; d < arr.length; d++) {
            let user = obj[arr[d]._id.toString()];
            if (!user) {
                user = obj[arr[d]._id.toString()] = arr[d];
            }
        }
        let newArr = [];
        for (const id in obj) {
            newArr.push(obj[id]);
        }
        //<<<<<<<
        return res.status(200).send({ status: 'ok', message: 'Usuario de caja', result: newArr });

    } catch (error) {
        console.log(error);
        return res.status(404).send({ status: 'No fount', message: 'No se puede mostra los datos', error });
    }
}
const dataNegocioUser = async (req, res) => {
    const { idUser, idNegocio } = req.params;

    const verifyNegocio = await validateNegocio(idNegocio);
    if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);

    const verifyUser = await verifyIdUser(idUser);
    if (verifyUser.success == false) return res.status(206).json({ status: 'No fount', error: 'Id incorrecto' });

    try {
        const dataNegocio = await {
            nombre: verifyNegocio.result?.nombre,
            propietario: verifyNegocio.result?.propietario,
            phoneNumber: verifyNegocio.result?.phoneNumber,
        }
        const dataUser = await {
            name: verifyUser.dataUser?.name,
            lastname: verifyUser.dataUser?.lastName,
            ci: verifyUser.dataUser?.ci,
            role: verifyUser.dataUser?.role,
        }
        return res.status(200).json({
            status: 'ok',
            message: 'Datos del usuario y del negocio',
            result: {
                negocio: dataNegocio,
                usuario: dataUser
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: 'No fount', error })
    }
}
//esta ruto se esta usando mucho y lo necesitan todos los roles
//lista de roles del usuario
const userRoleList = async (req, res) => {
    const { idUser } = req.params;
    const verifyUser = await verifyIdUser(idUser);
    if (verifyUser.success == false) return res.status(206).json({ status: 'No fount', error: 'Id incorrecto', message: verifyUser.message })
    try {
        const listRole = await User.user.findById({ _id: idUser }).populate('role');
        res.status(200).json({
            status: 'ok',
            message: 'Roles del usuario',
            result: listRole.role
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: 'No fount', error })
    }
}
//actualizar el estado del usuario
const updateStateUser = async (req, res) => {
    const { idUser } = req.params;
    const validateUserId = await verifyIdUser(idUser)
    if (validateUserId.success === false) return res.status(206).json({ status: 'No fount', message: validateUserId.message })
    try {
        const datas = await User.user.findById({ _id: idUser }).populate('role');
        await User.user.findOneAndUpdate({ _id: idUser }, {
            state: !datas.state
        });
        const dataUser = await User.user.findById({ _id: idUser });
        res.status(200).json({
            status: 'ok',
            message: 'Se actualizo el estado del usuario',
            result: dataUser
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: 'No fount', error })
    }
}
//verifica si su estado del usuario esta activo 
const simpleRute = async (req, res) => {
    const { idUser } = req.params;
    try {
        const roleUser = await User.user.findById({ _id: idUser });
        if (roleUser.state) {
            return res.status(200).send({
                status: 'ok',
                state: 'active',
                msg: 'Token no expirado'
            })
        }
        return res.status(200).send({
            status: 'ok',
            state: 'inactive',
            msg: 'Token no expirado'
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: 'No fount', error })
    }

}
//ruta temporal que indique que el sitema esta expirado
const datas = {//ejemplo de dato que se rescata para validar
    _id: '23dd',
    cliente: 'Maria Luiza Arancibia',
    pais: 'Bolivia',
    cuidad: 'Chuquisaca',
    provincia: 'Sucre',
    direccion: 'calle 3993',
    telefono: '85562',
    isCreated: '18-12-2021',
    clientFull: true
}
/* 
licencia del cliente
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
.eyJpZCI6IjIzZGQiLCJjbGllbnRlIjoiTWFyaWEgTHVpem
EgQXJhbmNpYmlhIiwidGVsZWZvbm8iOiI4NTU2MiIsImlua
XQiOiJOb3ZlbWJlciAyNiwgMjAyMSAxMjo1MCBQTSIsImVu
ZCI6Ik5vdmVtYmVyIDI3LCAyMDIxIDEyOjUwIFBNIiwiZXhwa
XJhIjoxNjM4MDMxODM0LCJ0aW1lTGlmZSI6ODY0MDB9.xJXna
YdCjfFQlBJaqvukk0ixUn_6RilJ6MXreuOs8ZI */
const generateLicence = async (req, res) => {
    //verificamos si el sitema con su id esta vigente
    try {
        const tokenAcces = await Token.generateLicenceToken(datas, 'day');

        return res.status(200).json({
            status: 'ok',
            message: 'Se creo la licencia del usuario',
            licence: tokenAcces
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            status: 'No fount',
            message: 'No se puedo crear la licencia del cliente'
        })
    }


}
//verificacion de la licencia
const verifiLisence = async (req, res) => {
    const { lisence, phone } = req.body;
    console.log(phone == datas.telefono && datas.clientFull == true, ' esto es lo que quiero ver ');
    if (phone == datas.telefono && datas.clientFull == true) {
        return res.status(200).json({
            status: 'ok',
            message: 'Licencia eterna'
        });
    }
    try {
        const stateAuthorization = await Token.validateLicence(req, lisence)
        if (stateAuthorization) {
            res.status(200).json({
                status: 'ok',
                message: 'Licencia vigente'
            });
        }
        else {
            res.status(206).send({ status: 'No fount', message: 'Licencia expirada' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: 'No fount', message: 'Error 400', error });
    }
}

//verficamos si existe algun usuario 
const userLength = async (req, res) => {
    try {
        const resp = await User.user.find();
        if (resp.length === 0) return res.status(200).json({ status: 'ok', message: 'No hay usuario registrados', userLength: 0 });
        return res.status(200).json({ status: 'ok', message: 'hay usuario registrados', userLength: resp.length })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            status: 'No fount',
            message: 'No se puede mostrar los datos'
        })
    }
}

///funciones de validacion
//valida los datos segun se les envie
const validateDatas = async (ci, email, phoneNumber, role, password, password1, idUser) => {
    if (ci || email || phoneNumber) {
        try {
            const resp = await User.user.find({ $or: [{ ci }, { phoneNumber }, { email }] }).populate("role");
            if (resp.length > 0) {
                let obj = ''
                await resp.map((data) => {
                    if (data.ci == ci) {
                        obj = 'CI ya esta en uso';
                        return;
                    }
                    if (data.email == email) {
                        obj = 'Email ya esta en uso'
                        return;
                    }
                    if (data.phoneNumber == phoneNumber) {
                        obj = 'Telfono ya esta en uso';
                        return;
                    }
                })
                return { success: false, message: obj }
            }
            return { success: true }
        } catch (error) {
            return { success: false, message: 'error 500' }
        }
    }
    if (password || password1) {
        if (!password) return { success: false, message: 'Contraceña es obligatorio', name: 'password' };
        if (!password1) return { success: false, message: 'Inserte la contraceña de verificacion', name: 'password1' };
        if (password != password1) return { success: false, message: 'Las contraceña no pueden ser diferentes', name: 'password1' }
        return { success: true }
    }
    if (role) {
        const roleUser = await User.user.findById({ _id: idUser }).populate('role');
        let roleExist = false;
        await roleUser.role.map((data) => {
            if (data.name == role) {
                roleExist = true;
            }
        });
        if (roleExist) {
            return { success: false, message: 'Ese rol ya esta registrado en este usario' }
        }
        return { success: true };
    }
    return { success: true };
}
//verificar si el id de un usario existe
const verifyIdUser = async (id_user) => {
    if (!id_user) return { success: false, message: 'No estas mandando el id de la tabla para actualizar los datos' }
    try {
        const dataUser = await User.user.findById({ _id: id_user }).populate('role');
        return { success: true, dataUser }
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Ese usuario no existe' }
    }
}



module.exports = {
    signUp,
    signIn,
    showListUser,
    editDataUser,
    addNewRole,
    removeRoleUser,
    simpleRute,
    editPersonalData,
    userRoleList,
    updateStateUser,
    generateLicence,
    verifiLisence,
    registerAdmin,
    verifiDatasUser,
    getlistUserActivos,
    dataNegocioUser,
    userLength
}