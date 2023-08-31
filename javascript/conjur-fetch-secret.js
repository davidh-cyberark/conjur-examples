const https = require('https');
const util = require('node:util'); 

// ignore ssl cert validation -- used for conjur self-signed cert
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


var proto="https://";
var host="conjur-host.example.com"; // Conjur Host
var apiprefix = "/api"; // api prefix for Conjur endpoint

// https://docs.conjur.org/Latest/en/Content/Developer/Conjur_API_Authenticate.htm
// POST /{authenticator}/{account}/{login}/authenticate
var authenticator = "authn"; // default authenticator
var account = "dhcybrlab"; // default account is "conjur"
var login = "admin";
var path = util.format("%s/%s/%s/%s/authenticate", apiprefix, authenticator, account, login);

// api key for the user named in the `login` var
var apikey = "xxx";

// variable identifier URL encoded, e.g. url_encode("vault9/lob9/safe9/secret1");
var identifier = "vault9%2Flob9%2Fsafe9%2Fsecret1";

var options = {
    hostname: host,
    port: 443,
    path: path,
    method: "POST",
    rejectUnauthorized: false,
    requestCert: true,
    headers: {
	'Accept-Encoding': "base64"
    }    
};
console.log("OPTIONS: " + JSON.stringify(options));


var url = proto + host + path;
console.log("URL: " + url);

let request = https.request(url, options, (res) => {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    let data = '';

    res.on('data', (chunk) => {
	data += chunk;
    });

    res.on("end", () => {
	console.log("TOKEN: " + data);
	getSecret(data, identifier);
    });

    res.on("error", (error) => {
	console.log("ERROR: " + error);
    });

});

request.write(apikey);
request.end();

// https://docs.conjur.org/Latest/en/Content/Developer/Conjur_API_Retrieve_Secret.htm?tocpath=Developer%7CREST%C2%A0APIs%7C_____8
function getSecret(sessiontoken, keyidentifier) {
    console.log("ENTERING GET SECRET");
    // GET /secrets/{account}/{kind}/{identifier}{?version}
    var options = {
	hostname: host,
	port: 443,
	path: path,
	method: "GET",
	rejectUnauthorized: false,
	requestCert: true,
	headers: {
	    'Authorization': "Token token=\""+sessiontoken+"\""
	}    
    };
    var kind = "variable";
    var path = util.format("%s/secrets/%s/%s/%s", apiprefix, account, kind, keyidentifier);
    var url = proto + host + path;
    console.log("URL: " + url);
    
    let request = https.request(url, options, (res) => {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));

	let data = '';

	res.on('data', (chunk) => {
	    data += chunk;
	});

	res.on("end", () => {
	    console.log("SECRET VALUE: " + data);
	});

	res.on("error", (error) => {
	    console.log("ERROR: " + error);
	});

    });
    request.end();
}
