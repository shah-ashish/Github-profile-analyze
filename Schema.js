import { Schema, model } from 'mongoose';

const apiControllSchema = new Schema({
    count: {
        type: Number,
        default: 0
    },
    date: {
        type: Date
    }
});

export default model('ApiControl', apiControllSchema);
