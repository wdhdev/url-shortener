const { Router } = require("express");

const router = Router();
const routes = require("./routes");

require("dotenv").config();

router.get("/", async (req, res) => {
    routes.index(req, res);
})

router.delete("/api/redirects", async (req, res) => {
    routes.api.redirects.delete(req, res);
})

router.get("/api/redirects", async (req, res) => {
    routes.api.redirects.get(req, res);
})

router.patch("/api/redirects", async (req, res) => {
    routes.api.redirects.patch(req, res);
})

router.put("/api/redirects", async (req, res) => {
    routes.api.redirects.put(req, res);
})

router.get("/dashboard", async (req, res) => {
    routes.dashboard(req, res);
})

router.get("/redirects", async (req, res) => {
    routes.redirects(req, res);
})

// Redirect requests
router.use(async (req, res, next) => {
    const Redirect = require("../models/Redirect");
    const path = req.url.toLowerCase().replace(/^\//g, "").split("/")[0].split("?")[0];

    Redirect.findOne({ path: path }, async (err, data) => {
        if(err) return next();

        if(!data) return res.status(404).redirect("/");

        if(data) {
            const subpath = req.url.replace(data.path, "").replace("/", "");

            if(data.redirect_path) return res.redirect(302, data.redirect + subpath);

            return res.redirect(302, data.redirect);
        }
    })
})

module.exports = router;
