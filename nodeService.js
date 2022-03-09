var Service = require('node-windows').Service;
var path = require('path');
path.join(__dirname, '/');



// create new service 
var svc = new Service({
    name:"server food",
    description:"servidor destinado la sistema de punto de ventas y emicion de tickets",
    script: __dirname + '/app.js'
    // nodeOptions: [
    //     '--harmony',
    //     '--max_old_space_size=4096'
    //   ]
})

console.log(svc.script)

svc.on('install',function(){
    svc.start();
})

//svc.install();
// svc.start();
// svc.uninstall();
svc.stop();

// node nodeService.js