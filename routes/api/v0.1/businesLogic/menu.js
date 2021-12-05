const {menu}  = require('../../../../database/collection/models/menu');
const {user} = require('../../../../database/collection/models/user');
//roles permitidos add solo el admin y el cocinero
//los que pueden ver son el addmin user caja mesero cocinero
class Menu {
    static async create(req,res){
        //constroles que tiene que tener 
        //id de sala que exista nombres no repetidos
        
        const {name,typeProduct,price,description,quantity}=req.body;
        const {idUser}=req.params;
        
        const verifyUser  = await validateUser(idUser);
        const verifyDatas =  validateDatas(name,typeProduct,price,quantity);
        
        //verificamos si existe el usuario
        if(!verifyUser) return res.status(206).json({status:'No fount',message:'Ese usuario no esta registrado'});
        if(verifyDatas.status === 'No fount') return res.status(206).json(verifyDatas)
        //verificamos si el nombre del menu ya esta registrado
        const verifyNameMenu = await menu.findOne({name});        
        if(verifyNameMenu) return res.status(206).json({status:'No fount',message:'Ese nombre ya esta registrado'})
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
            return res.status(200).json({
                status:'ok',
                message:'Datos guardados correctamente',
                result:resp
            })
        } catch (error) {
            console.error(error);
            return res.status(400).json({status:'No fount',message:'Error 400', error})
        }
    }
    static async list(req,res){  
        try {
            const listMesas = await menu.find();
            await listMesas.map((data)=>{
                console.log(data)
            })
            return res.status(200).send({
                status:'ok', 
                result:listMesas
            });
            
        } catch (error) {
            console.error(error);
            return res.status(400).json({status:'No fount',message:'Error 400', error})
        }
    }
}

async function validateUser(idUser){
    try {
        await user.findOne({ _id:idUser});
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}

function validateDatas(name,typeProduct,price,quantity){
    if(!name) return {status:'No fount',message:'Nombre del producto es obligatorio'};
    if(!typeProduct) return {status:'No fount',message:'Seleccione tipo de producto'};
    if(!price) return {status:'No fount',message:'El precio del producto es obligatorio'};
    if(isNaN(price)) return {status:'No fount',message:'El precio del producto no debe tener letras'};
    if(price < 0) return {status:'No fount',message:'El precio no puede ser negativo'};
    if(!quantity) return {status:'No fount',message:'La cantidad del producto es obligatorio'};
    if(isNaN(quantity)) return {status:'No fount',message:'La cantidad del producto no debe contener letras'};
    if(quantity < 0) return {status:'No fount',message:'La cantidad no puede tener numeros negativos'};
    return {status:'ok'}
    
}
module.exports = Menu;