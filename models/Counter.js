// const mongoose = require('mongoose');

// const CounterSchema = new mongoose.Schema({
//     _id: { type: String, required: true },
//     seq: { type: Number, default: 0 }
// });

// module.exports = mongoose.model('Counter', CounterSchema);


const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    date: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

CounterSchema.index({ _id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Counter', CounterSchema);
