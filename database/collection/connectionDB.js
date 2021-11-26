'use strict'

const mongoose = require('mongoose');
//mongodb://localhost/bd_mongo_aljand
//mongodb://192.168.1.179:27017/restaurantDB
const URL = 'mongodb://localhost:27017/restaurantDB';

// funcion recursiva de 3 intentos de conxion a la base da datos de mongofb
const connectDB =async ( reques=1 )=>{
    
    try {
        console.log('Estableciendo la conexion a la DB...')
        await mongoose.connect(URL,  {useNewUrlParser:true})
        console.log('connect to the mongoDB succesful')

    } catch (error) {
        if(reques>3){
            console.log('Error en conxion a la DB, conexion fallida')
            return null
        }
        console.log(error)
        console.log('Error en la conexion a mongoDb')
        console.log(`Volviendo a intentar la conxion... ${reques} - 3`)
        return connectDB(reques+1)
    }
}

connectDB()