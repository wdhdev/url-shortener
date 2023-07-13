module.exports = async (req, res) => {
    const Redirect = require("../../../models/Redirect");

    if(!req.headers.password) return res.status(401).json({ "message": "No password provided.", "code": "NO_PASSWORD" });
    if(req.headers.password !== process.env.password) return res.status(401).json({ "message": "The password provided was incorrect.", "code": "INCORRECT_PASSWORD" });

    if(!req.headers.path) return res.status(400).json({ "message": "No path name was provided.", "code": "NO_PATH_NAME" });

    const path = req.headers.path.toLowerCase();

    const redirect = await Redirect.findOne({ path: path });

    if(!redirect) return res.status(404).json({ "message": "Redirect does not exist.", "code": "INVALID_REDIRECT" });

    await redirect.delete();

    res.status(200).json({ "message": "Deleted redirect.", "code": "DELETED_REDIRECT", "redirect": { path: path } });
}
