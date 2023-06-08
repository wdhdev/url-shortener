module.exports = async (req, res) => {
    const schema = require("../../../models/schema");

    const data = await schema.find();

    const redirects = [];

    data.forEach(redirect => {
        redirects.push({
            "path": redirect.path,
            "redirect": redirect.redirect,
            "redirect_path": redirect.redirect_path
        })
    })

    res.status(200).json(redirects);
}
