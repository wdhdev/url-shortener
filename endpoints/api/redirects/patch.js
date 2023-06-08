module.exports = async (req, res) => {
    const schema = require("../../../models/schema");

    const password = req.headers.password;

    if(!password) return res.status(401).json({ "message": "No password provided.", "code": "NO_PASSWORD" });
    if(password !== process.env.password) return res.status(401).json({ "message": "The password provided was incorrect.", "code": "INCORRECT_PASSWORD" });

    if(!req.body.path) return res.status(400).json({ "message": "No path name was provided.", "code": "NO_PATH_NAME" });
    if(!req.body.redirect) return res.status(400).json({ "message": "No redirect was provided.", "code": "NO_REDIRECT" });

    const path = req.body.path.toLowerCase();
    const redirect = req.body.redirect;
    const redirect_path = req.body.redirect_path;

    if(!await schema.exists({ "path": path }).clone()) return res.status(204).json({ "message": "Path does not exist.", "code": "INVALID_PATH" });

    const old = await schema.findOne({ "path": path }, async (err, data) => data).clone();

    await schema.findOneAndUpdate({ "path": path }, { redirect: redirect, redirect_path: redirect_path });

    res.status(200).json({
        "message": "Updated redirect.",
        "code": "UPDATED_REDIRECT",
        "path": `${path}`,
        "old": {
            "redirect": `${old.redirect}`,
            "redirect_path": `${old.redirect_path}`
        },
        "new": {
            "redirect": `${redirect}`,
            "redirect_path": `${redirect_path}`
        }
    })
}
