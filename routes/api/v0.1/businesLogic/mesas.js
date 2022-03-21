const {mesa} = require('../../../../database/collection/models/mesa');
const {orden} = require('../../../../database/collection/models/orden');

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
            let newArr = [];
            for(var i=0;i<listMesas.length;i++){
                const resp = await ordenDelaMesa(listMesas[i]._id);
                if(resp.status == 'No fount')return res.status(206).json(resp)
                newArr.push({
                    dateCreate: listMesas[i].dateCreate,
                    idSala: listMesas[i].idSala,
                    name: listMesas[i].name,
                    numberChair: listMesas[i].numberChair,
                    state: listMesas[i].state,
                    updateDate: listMesas[i].updateDate,             
                    _id: listMesas[i]._id,
                    stateSaldo:resp.result ? resp.result?.stateSaldo:'',
                    stateOrden:resp.result? resp.result?.stateOrden:'',
                    listProduct:resp.result?resp.result?.listProduct:[]
                })
            }
            return res.status(200).send({
                status:'ok', 
                result:newArr
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({status:'No fount',message:'Error 400', error})
        }
    }
}
const ordenDelaMesa =async (idMesa)=>{
    try {
        const resp = await orden.findOne({$and: [{ stateSaldo: 'sincancelar' }, { idMesa }] });
        if(!resp) return {status:'ok', message:'no tiene una orden', result:null}
        return {status:'ok', message:'Continuar', result:resp};
    } catch (error) {
        console.error(error);
            return {status:'No fount',message:'Error 400', error}
    }
}
module.exports = Mesas;

/* .catch(err=>{
    // console.log(Object.keys(err))
    console.log(err?.response?.data?.error);
}) */