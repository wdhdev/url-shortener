const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const fs = require("fs");

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

const invalidPaths = [
    "assets",
    "css",
    "dashboard",
    "index",
    "responses",
    "robots.txt",
    "tailwind.config.js"
]

// Create or update a redirect
app.post("/api/create-update", (req, res) => {
    const password = req.body.password;

    if(!password) return res.status(401).redirect("https://wdh.gg/responses/error?error=NO_PASSWORD");
    if(password !== process.env.password) return res.status(401).redirect("https://wdh.gg/responses/error?error=INCORRECT_PASSWORD");

    const path = req.body.path.toLowerCase();
    const redirect = req.body.redirect;

    if(!path) return res.status(400).redirect("https://wdh.gg/responses/error?error=NO_PATH");
    if(!redirect) return res.status(400).redirect("https://wdh.gg/responses/error?error=NO_REDIRECT");

    const redirect_path = req.body.redirect_path || "false";

    if(!Boolean(redirect_path)) return res.status(400).redirect("https://wdh.gg/responses/error?error=INVALID_REDIRECT_PATH_OPTION");

    if(invalidPaths.includes(path)) return res.status(403).redirect("https://wdh.gg/responses/error?error=INVALID_PATH_NAME");

    schema.findOne({ path: path }, async (err, data) => {
        if(err) return res.status(500);

        if(data) {
            await schema.findOneAndUpdate({ path: path }, {
                redirect: redirect,
                redirect_path: redirect_path
            })

            let values = fs.readFileSync(__dirname + "/responses/updated.html", { encoding: "utf8" });

            values = values.replace("{path}", path);
            values = values.replace("{old_redirect}", data.redirect);
            values = values.replace("{new_redirect}", redirect);
            values = values.replace("{old_redirect_path}", data.redirect_path);
            values = values.replace("{new_redirect_path}", redirect_path);

            return res.send(values);
        } else {
            data = new schema({
                path: path,
                redirect: redirect,
                redirect_path: redirect_path
            })

            await data.save();

            let values = fs.readFileSync(__dirname + "/responses/created.html", { encoding: "utf8" });

            values = values.replace("{path}", path);
            values = values.replace("{redirect}", redirect);
            values = values.replace("{redirect_path}", redirect_path);

            return res.send(values);
        }
    })
})

// Delete a redirect
app.post("/api/delete", (req, res) => {
    const password = req.body.password;
    const path = req.body.path.toLowerCase();

    if(!password) return res.status(401).redirect("https://wdh.gg/responses/error?error=NO_PASSWORD");
    if(password !== process.env.password) return res.status(401).redirect("https://wdh.gg/responses/error?error=INCORRECT_PASSWORD");
    if(!path) return res.status(400).redirect("https://wdh.gg/responses/error?error=NO_PATH");

    schema.findOne({ path: path }, async (err, data) => {
        if(err) return res.status(500);

        if(data) {
            await data.delete();

            let values = fs.readFileSync(__dirname + "/responses/deleted.html", { encoding: "utf8" });

            values = values.replace("{path}", path);

            return res.send(values);
        } else {
            return res.status(404).redirect("https://wdh.gg/responses/error?error=INVALID_REDIRECT");
        }
    })
})

// Redirect requests
app.use(async (req, res, next) => {
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

app.listen(port, () => {
    console.log(`Listening on Port: ${port}`);
})
