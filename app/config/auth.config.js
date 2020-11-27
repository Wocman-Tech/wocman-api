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
		message_server: "",
		password: "",
		name: "Wocman Technology"
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
		message_server: "",
		password: "",
		name: "Wocman Technology"
    }
}
