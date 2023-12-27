const mongoose = require("mongoose");

const examCategorySchema = new mongoose.Schema({
    examCategory: {
        type: String,
    },
 
    isDisabled: {
        type: Boolean,
        default: false,
    },

    slag:{
        type: String,
        unique: true
    },
},
{
    timestamps: true,
}
);


module.exports = mongoose.model("examCategory", examCategorySchema);
