const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    path: String,
    redirect: String,
    redirect_path: Boolean
})

module.exports = mongoose.model("redirects", schema, "redirects")