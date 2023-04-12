var express = require('express');
var app = express();
const fs = require('fs');



let Web3 = require('web3');
const bodyParser = require('body-parser');
const path = require("path");

let SECRET = "SECRET_MESSAGE"


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/auth.html'));
});

app.get('/message/', function (req, res) {
    console.log("TEST");
    res.send({'message': SECRET});
});


app.post("/auth/", (req, res) => {
    console.log("GOT");

    console.log(req.body);

    // let sign = req.body['wallet'];
    let sign = req.body['sign'];
    let wallet = req.body['wallet'];

    let web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));


    let hash = web3.utils.sha3("TEST")

    TEST(res, hash, sign, wallet);

    //
});



async function TEST(res, hash, sign, wallet) {
    let web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

    console.log("HASH: " + hash);
    console.log("SIGN: " + sign);


    let signing_address = await web3.eth.accounts.recover(SECRET, sign);
    // let signing_address = await web3.eth.personal.ecRecover(hash, sign);

    console.log(wallet);
    console.log(signing_address);

    if(wallet.toLowerCase() !== signing_address.toLowerCase()) {
        console.log("NO MATCH");
        res.send({"status" : "FAILED"});
        return;
    }

    console.log("signing_address: " + signing_address);


    fs.appendFileSync('wallets.txt', signing_address + "\n");


    res.send({"status" : signing_address});
}


var server = app.listen(8000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});