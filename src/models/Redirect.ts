const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    path: String,
    redirect: String,
    redirect_path: Boolean
})

export default mongoose.model("redirects", schema, "redirects")