const {mesa} = require('../../../../database/collection/models/mesa');

//que el rol de admin cajero y mesero puedan ver esto
class Mesas {
    static async create(req,res){
        //constroles que tiene que tener 
        //id de sala que exista nombres no repetidos
        const {name,numberChair,numberClinetes}=req.body;
        const {idSala}=req.params;
        const newSala = new mesa({
            name,
            numberChair,
            numberClinetes,
            idSala,
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
        const {idSala} = req.params      
        try {
            const listMesas = await mesa.find({idSala});
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
module.exports = Mesas;

/* .catch(err=>{
    // console.log(Object.keys(err))
    console.log(err?.response?.data?.error);
}) */