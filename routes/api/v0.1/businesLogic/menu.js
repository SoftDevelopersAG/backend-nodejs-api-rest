const { menu } = require('../../../../database/collection/models/menu');
const { user } = require('../../../../database/collection/models/user');
//const socketControllers = require('../../../../socket/controllers/socketControllers')
//roles permitidos add solo el admin y el cocinero
//los que pueden ver son el addmin user caja mesero cocinero

class Menu {

    static async create(req, res) {
        //constroles que tiene que tener 
        //id de sala que exista nombres no repetidos
        
        const { name, typeProduct, price, description, quantity } = req.body;
        const { idUser } = req.params;

        

        const verifyUser = await validateUser(idUser);
        const verifyDatas = validateDatas(name, typeProduct, price, quantity);

        //verificamos si existe el usuario
        if (!verifyUser) return res.status(206).json({ status: 'No fount', message: 'Ese usuario no esta registrado' });
        if (verifyDatas.status === 'No fount') return res.status(206).json(verifyDatas)
        //verificamos si el nombre del menu ya esta registrado
        const verifyNameMenu = await menu.findOne({ name });
        if (verifyNameMenu) return res.status(206).json({ status: 'No fount', message: 'Ese nombre ya esta registrado' })
        const newSala = new menu({
            name,
            typeProduct,
            price,
            quantity,
            description,
            idUser
        });
        try {
            const resp = await newSala.save();
            //socketControllers('[product] addNewProduct',resp);
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
            const listMesas = await menu.find();
            /* await listMesas.map((data)=>{
                console.log(data)
            }) */
            return res.status(200).send({
                status: 'ok',
                result: listMesas
            });

        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
    // actulizar el menu o el producto, esta actualizacion funciona de forma que cuando se manda con el mismo nombre actaliza los datos restantes,
    //pero cuando el nombre no es igual este busca en la lista de productos si ese nombre ya esta registrado para no repetir nombre, si ese nombre
    // ya esta registrado manda un mensaje de errory si no esta registrado actualiza los datos
    static async updateMenuDatas(req, res) {
        const { name, typeProduct, price, description, quantity } = req.body;
        const { idMenu } = req.params;
        const oneMenu = await verifyOneMenu(idMenu);
        if (oneMenu.success == false) return res.status(206).json({ status: 'No fount', message: 'Menu o producto no registrado' });

        const updateDatas = await {
            name: name || oneMenu.resp.name,
            typeProduct: typeProduct || oneMenu.resp.typeProduct,
            price: price || oneMenu.resp.price,
            description: description || oneMenu.resp.description,
            quantity: quantity || oneMenu.resp.quantity,
        }

        try {
            if (oneMenu.resp.name == name) {
                console.log('el nombre es igual')
                await menu.findOneAndUpdate({ _id: idMenu }, updateDatas);
                const newMenu = await menu.findOne({ _id: idMenu });
                return res.status(200).send({
                    status: 'ok',
                    message: 'Se actulizo el menu',
                    result: newMenu
                });
            }

            const verifyName = await menu.find({ name });
            if (verifyName.length > 0) {
                console.log('verifica si ese nombre existe')
                return res.status(206).json({
                    status: 'No fount',
                    message: 'No puedes actualizar con ese nombre porque ya esta registrado'
                })
            }
            await menu.findOneAndUpdate({ _id: idMenu }, updateDatas);
            const newMenu = await menu.findOne({ _id: idMenu });
            return res.status(200).send({
                status: 'ok',
                message: 'Se actulizo el menu',
                result: newMenu
            });

        } catch (error) {
            console.error(error);
            return res.status(400).json({ status: 'No fount', message: 'Error 400', error })
        }
    }
}

async function validateUser(idUser) {
    try {
        await user.findOne({ _id: idUser });
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}

async function verifyOneMenu(idMenu) {
    try {
        const resp = await menu.findOne({ _id: idMenu });
        return { success: true, resp }
    } catch (error) {
        console.error(error);
        return { success: false }
    }
}

function validateDatas(name, typeProduct, price, quantity) {
    if (!name) return { status: 'No fount', message: 'Nombre del producto es obligatorio' };
    if (!typeProduct) return { status: 'No fount', message: 'Seleccione tipo de producto' };
    if (!price) return { status: 'No fount', message: 'El precio del producto es obligatorio' };
    if (isNaN(price)) return { status: 'No fount', message: 'El precio del producto no debe tener letras' };
    if (price < 0) return { status: 'No fount', message: 'El precio no puede ser negativo' };
    if (!quantity) return { status: 'No fount', message: 'La cantidad del producto es obligatorio' };
    if (isNaN(quantity)) return { status: 'No fount', message: 'La cantidad del producto no debe contener letras' };
    if (quantity < 0) return { status: 'No fount', message: 'La cantidad no puede tener numeros negativos' };
    return { status: 'ok' }
}
module.exports = Menu;