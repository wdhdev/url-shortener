const { Router } = require("express");
const router = Router();

require("dotenv").config();

const schema = require("../models/schema");

const invalidPaths = [
    "api",
    "assets",
    "dashboard",
    "index",
    "js",
    "redirects",
    "robots.txt",
    "tailwind.config.js"
]

// Get all redirects
router.get("/api/redirects", async (req, res) => {
    const redirects = [];

    schema.find({}, async (err, data) => {
        if(err) return res.status(500);

        data.forEach(redirect => {
            redirects.push({
                "path": redirect.path,
                "redirect": redirect.redirect,
                "redirect_path": redirect.redirect_path
            })
        })

        return res.status(200).json(redirects);
    })
})

// Create a redirect
router.put("/api/redirects", async (req, res) => {
    const password = req.headers.password;

    if(!password) return res.status(401).json({ "message": "No password provided.", "code": "NO_PASSWORD" });
    if(password !== process.env.password) return res.status(401).json({ "message": "The password provided was incorrect.", "code": "INCORRECT_PASSWORD" });

    if(!req.body.path) return res.status(400).json({ "message": "No path name was provided.", "code": "NO_PATH_NAME" });
    if(!req.body.redirect) return res.status(400).json({ "message": "No redirect was provided.", "code": "NO_REDIRECT" });

    const path = req.body.path.toLowerCase();
    const redirect = req.body.redirect;
    const redirect_path = req.body.redirect_path;

    let validPath = true;

    for (const invalidPath of invalidPaths) {
        if(path.startsWith(invalidPath)) validPath = false;
    }

    if(!validPath) return res.status(403).json({ "message": "The provided path name is invalid.", "code": "INVALID_PATH_NAME" });

    if(await schema.exists({ path: path }).clone()) return res.status(400).json({ "message": "Redirect already exists.", "code": "REDIRECT_EXISTS" });

    data = new schema({
        path: path,
        redirect: redirect,
        redirect_path: redirect_path
    })

    await data.save();

    res.status(200).json({
        "message": "Created redirect.",
        "code": "CREATED_REDIRECT",
        "redirect": {
            "path": path,
            "redirect": redirect,
            "redirect_path": redirect_path
        }
    })
})

// Update a redirect
router.patch("/api/redirects", async (req, res) => {
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
        "old_redirect": {
            "path": `${old.path}`,
            "redirect": `${old.redirect}`,
            "redirect_path": `${old.redirect_path}`
        },
        "new_redirect": {
            "path": `${path}`,
            "redirect": `${redirect}`,
            "redirect_path": `${redirect_path}`
        }
    })
})

// Delete a redirect
router.delete("/api/redirects", async (req, res) => {
    if(!req.headers.password) return res.status(401).json({ "message": "No password provided.", "code": "NO_PASSWORD" });
    if(req.headers.password !== process.env.password) return res.status(401).json({ "message": "The password provided was incorrect.", "code": "INCORRECT_PASSWORD" });

    if(!req.headers.path) return res.status(400).json({ "message": "No path name was provided.", "code": "NO_PATH_NAME" });

    const path = req.headers.path.toLowerCase();

    if(!await schema.exists({ path: path }).clone()) return res.status(404).json({ "message": "Redirect does not exist.", "code": "INVALID_REDIRECT" });

    await schema.findOneAndDelete({ path: path });

    return res.status(200).json({ "message": "Deleted redirect.", "code": "DELETED_REDIRECT", "redirect": { "path": path } });
})

// Redirect requests
router.use(async (req, res, next) => {
    const path = req.url.toLowerCase().replace(/^\//g, "").split("/")[0].split("?")[0];

    schema.findOne({ path: path }, async (err, data) => {
        if(err) return next();

        if(!data) {
            return res.status(404).redirect("/");
        }

        if(data) {
            const subpath = req.url.replace(data.path, "").replace("/", "");

            if(data.redirect_path) return res.redirect(302, data.redirect + subpath);

            return res.redirect(302, data.redirect);
        }
    })
})

module.exports = router;