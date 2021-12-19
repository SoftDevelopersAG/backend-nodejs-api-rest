'use strict';


const { spawn } = require('child_process');
const { sign } = require('crypto');
const path = require('path');

const DB_NAME = 'restaurantDB';
const ARCHIVE_PATH = path.join(__dirname, './', `${DB_NAME}.gzip`);


const backupsDB=()=>{
    const child = spawn('mongodump', [
        `--db=${DB_NAME}`,  
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`,
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
        if (code) console.log('Process exit with code:', code)
        else if(signal) console.log('Process exit with signal:', signal)
        else console.log('Backup succesful')
    
    })
}

// backupsDB();

module.exports = backupsDB;