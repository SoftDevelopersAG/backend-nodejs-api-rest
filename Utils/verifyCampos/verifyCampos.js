'use strict';
class Verify{
    
    // verifica que los campos requeridos sean completos en una peticion
    static async verificacionCamposRequeridos(ArrayCampos){
        console.log(ArrayCampos)
        
        const camposRequired =[];
        for(var i=0; i<ArrayCampos.length; i++){
            if(ArrayCampos[i] === undefined || ArrayCampos[i] === null || ArrayCampos[i] === ''){
                camposRequired.push(ArrayCampos[i]);
            }
        }
        
        if(camposRequired.length > 0){
            return false
        }
        return true;
    }
}



module.exports = Verify