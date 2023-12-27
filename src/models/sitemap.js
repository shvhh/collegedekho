const mongoose = require("mongoose");
const sitemapSchema = new mongoose.Schema(
    {
        url: {
            type: String,
        },
        lastmod: {
            type: Date,
        },
        priority: {
            type: Number,
        },
    },
    {timestamps: true}


);

module.exports = mongoose.model("sitemap", sitemapSchema);
