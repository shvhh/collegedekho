const mongoose = require("mongoose");

const courseCategorySchema = new mongoose.Schema({
    category: {
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
    isTop:{
        type: Boolean,
        default: false
    },
},
{
    timestamps: true,
}
);


module.exports = mongoose.model("courseCategory", courseCategorySchema);
