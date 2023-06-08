module.exports = {
    api: {
        redirects: {
            delete: require("../endpoints/api/redirects/delete"),
            get: require("../endpoints/api/redirects/get"),
            patch: require("../endpoints/api/redirects/patch"),
            put: require("../endpoints/api/redirects/put")
        }
    },
    dashboard: require("../endpoints/dashboard"),
    index: require("../endpoints/index"),
    redirects: require("../endpoints/redirects")
}
