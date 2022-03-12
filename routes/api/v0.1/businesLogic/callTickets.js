const Verify = require("../../../../Utils/verifyCampos/verifyCampos");
const VentaSchema =require('../../../../database/collection/models/venta');
const { estadoFinanciero } = require('../../../../database/collection/models/estadoFinanciero');


class CallTickets{

   static async dataVentasToCallTickets(req, res){
    try{
        var {stateOrdenRestaurante} = req.params;
        var verify = await Verify.verificacionCamposRequeridos([stateOrdenRestaurante]);
        if(!verify) return res.status(206).json({status:'No fount',message:'complete los campos requeridos'});


        const estasdoFinanciero = await estadoFinanciero.findOne({state:true}).populate(['listVentas']);
        
        const listVentas =await estasdoFinanciero.listVentas;
        

        if(stateOrdenRestaurante==='todo'){
            // var listVentasDetail = SchemaVenta.Venta.fin
            var listVentasDetail = new Array();
            for(var i =0; i<listVentas.length;i++){
                // if(listVentas[i].stateOrdenRestaurante===stateOrdenRestaurante){
                    var dataVenta =await listProductosPortVentas(listVentas[i]._id);
                    listVentasDetail.push(dataVenta);
                // }
            }
            var lengthList = listVentasDetail.length;
            return  res.status(200).send({"status":"ok","message":"lista de ventas", "tolalResults":lengthList,"result":listVentasDetail});
        }
        if(stateOrdenRestaurante==='espera-proceso'){
            var listVentasDetail=new Array();
                for(var i =0; i<listVentas.length;i++){
                    if(listVentas[i].stateOrdenRestaurante==='proceso' || listVentas[i].stateOrdenRestaurante==='espera'){
                        var dataVenta =await listProductosPortVentas(listVentas[i]._id);
                        listVentasDetail.push(dataVenta);
                    }
                 }
             
            var lengthList = listVentasDetail.length;
            return  res.status(200).send({"status":"ok","message":"lista de ventas, en espera y en proceso", "tolalResults":lengthList,"result":listVentasDetail});
        }
        if(stateOrdenRestaurante==='espera' || stateOrdenRestaurante === 'proceso' || stateOrdenRestaurante ==='enviado'){
                // const listaVentasPendientes = await listVentas.filter((listVentas) => listVentas.stateOrdenRestaurante === stateOrdenRestaurante);
                var listVentasDetail = new Array();
                for(var i =0; i<listVentas.length;i++){
                    if(listVentas[i].stateOrdenRestaurante===stateOrdenRestaurante){
                        var dataVenta =await listProductosPortVentas(listVentas[i]._id);
                        listVentasDetail.push(dataVenta);
                    }
                }
                var lengthList = listVentasDetail.length;
                var listaInversa =await  listVentasDetail.reverse();
             
                return res.status(200).send({"status":"ok","message":"lista de ventas", "tolalResults":lengthList,"result":listaInversa});
        }else{

            return res.status(200).json({status:'No fount',message:'Parametro de la peticion no valido'});
        }
        
   }
   catch(error){
            console.log("error en la consulta, stateOrdenRestaurante\n",error);
            return res.status(400).send({status:'No fount',error:"error en el servidor",err:error});
   }
   }

   static async sendSocketTickets(dataVenta=""){
       console.log("contructor 2")
   }
}


const listProductosPortVentas = async (idVentas) => {
    console.log(idVentas)
    var dataVenta = await VentaSchema.Venta.findById({_id:idVentas}).populate(['products']);
    // console.log(dataVenta)
    return dataVenta;
}





module.exports=CallTickets;