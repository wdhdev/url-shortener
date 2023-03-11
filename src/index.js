const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const schema = require("./models/schema");

require("dotenv").config();

const port = process.env.port || 3000;

// Parse body of incoming requests
app.use(bodyParser.urlencoded({ extended: true }));

// Host public files
app.use(express.static(__dirname + "/public", {
    extensions: ["html"]
}))

// Connect to Database
const database = require("./util/database");
database();

// Create or update a redirect
app.post("/api/redirects", (req, res) => {
    const password = req.body.password;

    if(!password) return res.status(401).redirect("https://wdh.gg/responses/error?error=NO_PASSWORD");
    if(password !== process.env.password) return res.status(401).redirect("https://wdh.gg/responses/error?error=INCORRECT_PASSWORD");

    const { path, redirect } = req.body;

    if(!path) return res.status(400).redirect("https://wdh.gg/responses/error?error=NO_PATH");
    if(!redirect) return res.status(400).redirect("https://wdh.gg/responses/error?error=NO_REDIRECT");

    let redirect_path = req.body.redirect_path || "false";

    if(!Boolean(redirect_path)) return res.status(400).redirect("https://wdh.gg/responses/error?error=INVALID_REDIRECT_PATH_OPTION");

    schema.findOne({ path: path }, async (err, data) => {
        if(err) return res.status(500);

        if(data) {
            await schema.findOneAndUpdate({ path: path }, {
                redirect: redirect,
                redirect_path: redirect_path
            })

            return res.status(200).redirect(`https://wdh.gg/responses/updated?path=${path}&old_redirect=${data.redirect}&new_redirect=${redirect}&old_redirect_path=${data.redirect_path}&new_redirect_path=${redirect_path}`);
        } else {
            data = new schema({
                path: path,
                redirect: redirect,
                redirect_path: redirect_path
            })

            await data.save();

            return res.status(201).redirect(`https://wdh.gg/responses/created?path=${path}&redirect=${redirect}&redirect_path=${redirect_path}`);
        }
    })
})

// Delete a redirect
app.post("/api/redirects/delete", (req, res) => {
    const password = req.body.password;
    const path = req.body.path;

    if(!password) return res.status(401).redirect("https://wdh.gg/responses/error?error=NO_PASSWORD");
    if(password !== process.env.password) return res.status(401).redirect("https://wdh.gg/responses/error?error=INCORRECT_PASSWORD");
    if(!path) return res.status(400).redirect("https://wdh.gg/responses/error?error=NO_PATH");

    schema.findOne({ path: path }, async (err, data) => {
        if(err) return res.status(500);

        if(data) {
            await data.delete();

            return res.status(204).redirect(`https://wdh.gg/responses/deleted?path=${path}`);
        } else {
            return res.status(404).redirect("https://wdh.gg/responses/error?error=INVALID_REDIRECT");
        }
    })
})

// Redirect requests
app.use(async (req, res, next) => {
    const path = req.url.replace(/^\//g, "").split("/")[0].split("?")[0];

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

app.listen(port, () => {
    console.log(`Listening on Port: ${port}`);
})