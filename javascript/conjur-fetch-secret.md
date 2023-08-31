# Javascript/NodeJS Conjur Fetch Secret Example

## Summary

[Source file](conjur-fetch-secret.js)

This code performs the following steps:

1. Authenticate to Conjur using the login-user and login-user's apikey to fetch a session token.
2. Using the session token, fetch the value of a stored secret.

## Setup

This example uses the node `https` and `util` libraries.

```javascript
const https = require('https');
const util = require('node:util'); 
```

When using self-hosted Conjur, a self-signed cert is often used during
dev.  Set this env var to zero to disable cert checking.

```javascript
// ignore ssl cert validation -- used for conjur self-signed cert
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
```

## Configuration

These variables will need to be changed to point to your Conjur environment settings.

For reference: <https://docs.conjur.org/Latest/en/Content/Developer/Conjur_API_Authenticate.htm>

**Note: the main variables to change are marked with `-- CHANGEME`**

```javascript
var host="conjur-host.example.com"; // Conjur Host -- CHANGEME
var proto="https://";
var apiprefix = "/api"; // api prefix for Conjur endpoint

var authenticator = "authn"; // default authenticator
var account = "conjur"; // default account is "conjur"
var login = "admin"; // Conjur user -- CHANGEME

// POST /{authenticator}/{account}/{login}/authenticate
var path = util.format("%s/%s/%s/%s/authenticate", apiprefix, authenticator, account, login);

// api key for the user named in the `login` var
var apikey = "xxx"; // Conjur user's api key -- CHANGEME

// variable identifier URL encoded, e.g. url_encode("vault9/lob9/safe9/secret1");
var identifier = "vault9%2Flob9%2Fsafe9%2Fsecret1"; // -- CHANGEME
```

## Step 1 -- Fetch Session Token With User/ApiKey

```javascript
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

	// We have the Session token, now we can fetch the secret from Conjur
	getSecret(data, identifier);
    });

    res.on("error", (error) => {
	console.log("ERROR: " + error);
    });

});

request.write(apikey);
request.end();
```

## Step 2 - Fetch Secret From Conjur With Session Token

This is the function that is called after the session token has been obtained.p

```javascript
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
```

## License

This repository is licensed under Apache License 2.0 - see [`LICENSE`](LICENSE) for more details.

## __END__
