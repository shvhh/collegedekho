const mongoose = require('mongoose');
const SearchHistory = new mongoose.Schema({

userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
},
searchText: {
    type: String,
    
},


},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SearchHistory", SearchHistory);
