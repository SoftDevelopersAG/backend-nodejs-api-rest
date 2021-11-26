'use strict'

const mongoose = require('mongoose');

const URL = 'mongodb://192.168.100.9:27017/restaurantDB';

// funcion recursiva de 3 intentos de conxion a la base da datos de mongoDB
const connectDB =async ( reques=1 )=>{
    
    try {
        console.log('Estableciendo la conexion a la DB...')
        await mongoose.connect(URL,  {useNewUrlParser:true})
        console.log('connect to the mongoDB succesful')

    } catch (error) {
        if(reques>3){
            console.log('Error en la conxion a la DB, conexion fallida')
            return null
        }
        console.log(error)
        console.log('Error en la conexion a mongoDB')
        console.log(`Volviendo a intentar la conxion... ${reques} - 3`)
        return connectDB(reques+1)
    }
}

connectDB()