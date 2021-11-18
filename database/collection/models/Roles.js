'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const RolesSchema = new Schema(
    {
        name: String
    }
)

var Role = mongoose.model('Role', RolesSchema);

module.exports = Role;
