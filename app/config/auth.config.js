const { workstation }  = require("./env.config");

if (workstation.toLowerCase() === "web") {
    module.exports = {
        secret: "",
        resolve: "",
        port: '/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: "",
        message_server: "Yahoo",
        password: "",
        name: "Wocman Technology",
        website: ""

    }
}

if(workstation.toLowerCase() === "localhost"){
    module.exports = {
        secret: "",
        resolve: "",
        port: '',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: "",
        message_server: "Yahoo",
        password: "",
        name: "Wocman Technology",
        website: ""

    }
}
