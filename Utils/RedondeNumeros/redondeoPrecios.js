'use strict'

class Redonde {

    static  redondearPrecio(monto) {
        try{
            let precioRedondeado =  Math.round(monto*100)/100;
            return precioRedondeado;
        }
        catch(error){
            console.log(`error al redondear el monto en la funcion redondearPrecio ${monto}`);
            return monto;
        }
    }
}

module.exports = Redonde;