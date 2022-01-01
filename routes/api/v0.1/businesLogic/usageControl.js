'use strict';
const UsageControl = require('../../../../database/collection/tiemposDeUsoYpermisos/controlUseModel');

const createUsageControl=async (dataTienda)=>{
    if(dataTienda !== undefined && dataTienda != '' && JSON.stringify(dataTienda)!='{}'){
    
        try{
            const UsageControlData = new UsageControl.usageControl({

                idTienda    : dataTienda?._id,
                nameTienda  : dataTienda?.nombre,
                nameOwner   : dataTienda?.propietario,
                country     : dataTienda?.country,
                phoneNumber : dataTienda?.phoneNumber,
                callingCode : dataTienda?.callingCodes,
                state       : 'active',
                paymentPlan : "2050/12/18 20:17:30",
            })
            // paymentPlan: "2021/06/18 16:17:30" --> plan de pago actual --> axample : new Date("2021/06/18 16:17:30")
    
            const data = await UsageControlData.save()
            return data;
        }
        catch(err){
            console.log('ddddddd3333333333333333333333333333333333')
            console.log({error:'error en usagecontrol ',err})
            console.log('ddddddd3333333333333333333333333333333333')
            return ''
        }
        
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
            return res.status(200).send({status:"ok",message:'show detail payment use',result:data})
        }
        return res.status(400).send({status:404, error:'no found data', message:"idneogcio no vigente"})
        
    }
    return res.status(400).send({status:404, error:'no found data', message:"idneogcio requerido"})

    
}


module.exports = {
    createUsageControl,
    checkPaymentControl
}
