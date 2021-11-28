'use strict';
const UsageControl = require('../../../../database/collection/tiemposDeUsoYpermisos/controlUseModel');

const createUsageControl=(dataTienda)=>{
    if(dataTienda !== undefined && dataTienda != '' && JSON.stringify(dataTienda)!='{}'){
        

        const UsageControlData = new UsageControl.usageControl({

            idTienda    : dataTienda._id,
            nameTienda  : dataTienda.nombre,
            nameOwner   : dataTienda.propietario,
            country     : dataTienda.country.name,
            phoneNumber : dataTienda.telefono,
            callingCode : dataTienda.country.callingCodes[0],
            state       : 'active',
            paymentPlan : "2021/06/18 20:17:30",
        })
        // paymentPlan: "2021/06/18 16:17:30" --> plan de pago actual --> axample : new Date("2021/06/18 16:17:30")

            UsageControlData.save((err, dataSaved)=>{
            if(dataSaved){
               return console.log({message:"UsageControl guardado exitosamente", deatil:dataSaved})
            }
            return console.log({error:"error al guardar usagecControl",detail:dataTienda, detailError:err})
        })
    }
}


const checkPaymentControl = async(req, res)=>{

    console.log(req.params.idnegocio);
    var idnegocio =await req.params.idnegocio;
    console.log(idnegocio.length);
    if(idnegocio.length===24){

        const data = await  UsageControl.usageControl.findOne({idTienda:idnegocio})
        if(data){
            const d1 = await new Date(data.paymentPlan).getTime();
            const d2 = await new Date().getTime();
            const statePayment = await d1-d2;
            console.log(statePayment)
            if(statePayment<1 && data.state!="desabled"){
                var dUpdate= await UsageControl.usageControl.findByIdAndUpdate({_id:data._id},{state:"desabled"})
                if(!dUpdate) return res.status(200).send({message:'show detail payment use',result:data})
                var dataUpdated =await  UsageControl.usageControl.findById({_id:data._id})
                return res.status(200).send({message:'show detail payment use',result:dataUpdated})
                
            }
            if(statePayment>1 && data.state==="desabled"){
                var dUpdate= await UsageControl.usageControl.findByIdAndUpdate({_id:data._id},{state:"active"})
                if(!dUpdate) return res.status(200).send({message:'show detail payment use',result:data})
                var dataUpdated =await  UsageControl.usageControl.findById({_id:data._id})
                return res.status(200).send({message:'show detail payment use',result:dataUpdated})
            }
            return res.status(200).send({message:'show detail payment use',result:data})
        }
        return res.status(400).send({err:'no found data'})
        
    }
    return res.status(400).send({err:'idNegocio is required'})

    
}


module.exports = {
    createUsageControl,
    checkPaymentControl
}
