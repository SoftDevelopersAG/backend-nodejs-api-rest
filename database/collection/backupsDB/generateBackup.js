'use strict';

const { spawn } = require('child_process');
const path = require('path');
const cron  = require('node-cron')

const DB_NAME = 'restaurantDB';
var dateString = new Date().toLocaleDateString().replace(/[/]/g,'-');
const nameDB = `${DB_NAME}-${dateString}`;
const ARCHIVE_PATH = path.join(__dirname, './listBackups', `${nameDB}.gzip`);

const restoreDB=()=>{
    // mongorestore --gzip --db restaurantDB --archive=restaurantDB.gzip


    const child = spawn('mongorestore', [
        `--gzip`,
        `--db=${DB_NAME}`,
        `--archive=${ARCHIVE_PATH}`,
    ]);
    child.stdout.on('data',(data)=>{
        console.log(`stdout: ${data}`);
    });
}


const backupsDB=()=>{
    
    const child = spawn('mongodump', [
        `--db=${DB_NAME}`,  
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`
    ])

    child.stdout.on('data',(data)=>{
        console.log('stdout:\n', data)
    })
    child.stderr.on('data',(data)=>{
        console.log('stderr:\n', data)
    })
    child.on('error',(error)=>{
        console.log('error:\n', error)
    })
    child.on('exit',(code, signal)=>{
        if (code) console.log('Slida del processo con codigo:', code)
        else if(signal) console.log('Salia del proceso:', signal)
        else console.log('Backup database succesful')
    
    })
}

// realiza los backups cada dia de las semana
cron.schedule(' * * * 1 * *',()=>{
    backupsDB();
    console.log("se realizo el backup")
});



module.exports = backupsDB;