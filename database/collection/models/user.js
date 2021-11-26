'use strict'


const mongoose = require('mongoose');
const {Schema} = mongoose;

const User = new Schema({
    name           : String,
    lastName       : String,
    ci             : String,
    email          : String,
    phoneNumber    : Number,
    direction      : String,
    urlPhotoAvatar : String,
    password       : String,
    password1      : String,
    state: {
        type: Boolean,
        enum: [true, false],
        default: true
    },
    role: [{
        ref: "Role",
        type: Schema.Types.ObjectId,
    }],
    dateCreateAcount : { type : Date, default : Date.now }
})


var user = mongoose.model('user',User)

module.exports={
    user
}
