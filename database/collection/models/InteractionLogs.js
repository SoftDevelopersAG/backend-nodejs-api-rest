'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InteractionLogsSchema = new Schema({
    interactionLogs: { 
        type: Date,
        default: Date.now
    }
})


var interactionLogs = mongoose.model('InteractionLog', InteractionLogsSchema);

module.exports = {
    interactionLogs
}