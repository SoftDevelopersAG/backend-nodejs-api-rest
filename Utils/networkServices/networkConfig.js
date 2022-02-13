'use strict'
const network = require('network');
const fs = require('fs');
const path = require('path');
const ipServer = require('../../config/configApi.json')



// const file = require('../../config/configApi2.json')
class NetworkConfig{

    static async updateIpServer(currentIP = ''){
       try{
            network.get_active_interface(function(err, data) {
                console.log(data);
                if(data.ip_address != ipServer.configApi[0].hostApi){
                    var data = {"configApi":[
                        {
                            "hostApi":`http://${data.ip_address}:4000`
                        }
                    ]}
    
                    fs.writeFileSync(path.join(__dirname, '../../config/configApi.json'), JSON.stringify(data));
                }
               
            })
       }
       catch(error){
           console.log("Error al actualizar la ip del servidor\n",error);
       }
        
    }
}


module.exports = NetworkConfig;