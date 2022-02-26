'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const File = new Schema({
    idParent:     String,
    nameParent:   String,
    nameFile:     String,
    physicalPath: String,
    relativePath: String,
    linkFile:     String,
    linkFilePartial: String,
    size:         Number

})


var file = mongoose.model('file', File);


module.exports = {
    file
}
