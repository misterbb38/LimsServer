// const mongoose = require('mongoose');

// const smsSchema = new mongoose.Schema({
//   phoneNumber: {
//     type: String,
//     required: true,
//   },
//   message: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ['sent', 'failed'],
//     default: 'sent',
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const SMS = mongoose.model('SMS', smsSchema);

// module.exports = SMS;

const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  analyseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analyse',
    required: true,
  },
  sendCount: {
    type: Number,
    default: 1,
  },
});

const SMS = mongoose.model('SMS', smsSchema);

module.exports = SMS;
