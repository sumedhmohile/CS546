
const creds = {
  N_base10: "21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819",
  g_base10: "2",
  k_base16: "5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300"
}


const Session = require('thinbus-srp/server.js')(creds.N_base10, creds.g_base10, creds.k_base16);

const express_lib = require('express');
const path = require('path');
var app = express_lib();
app.use(express_lib.static(path.join(__dirname,'public')))
const bodyParser = require('body-parser')
var exports = module.exports = {};

app.get('/', function (req, res) {
  res.sendFile('login.html', { root: __dirname });
});

app.get('/register.html', function (req, res) {
  res.sendFile('register.html', { root: __dirname });
});

app.get('/login.html', function (req, res) {
  res.sendFile('login.html', { root: __dirname });
});

app.get('/browser.thinbus.js', function (req, res) {
  res.set('Content-Type', 'application/javascript');
  res.sendFile('browser.thinbus.js', { root: __dirname });
});

const memdown_lib = require('memdown');
const db = new memdown_lib('srp')
const cache = new memdown_lib('challenge')


var EParser = bodyParser.urlencoded({ extended: false })

app.post('/save', EParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)

  var data = { salt: req.body.salt, verifier: req.body.verifier };

  db.put(req.body.username, JSON.stringify(data), function (err) {
    if (err) throw err
  })
  
  res.send('Registration successful,' + req.body.username + '!</br> Please Login <a href="/login.html">here</a>.');

});


app.get('/load', function (req, res) {
  const username = req.query.username

  if (typeof username === 'undefined') {
    return res.sendStatus(400);
  } else {
    db.get(username, { asBuffer: false }, function (err, value) {
      if (err) {

        return res.sendStatus(204)
      } else {
        res.setHeader('Content-Type', 'application/json');

        const result = JSON.parse(value);
        delete result.verifier;

        res.send(JSON.stringify(result));
      }
    })
  }
});

app.post('/challenge', EParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  const username = req.body.username

  if (typeof username === 'undefined') {
    return res.sendStatus(400);
  } else {
    db.get(username, { asBuffer: false }, function (err, value) {
      if (err) {

        return res.sendStatus(204)
      } else {
        res.setHeader('Content-Type', 'application/json');

        const result = JSON.parse(value);

        const salt = result.salt;
        const verifier = result.verifier;


        const Session = require('thinbus-srp/server.js')(creds.N_base10, creds.g_base10, creds.k_base16);


        var terminate_server = new Session();
        const B = terminate_server.step1(username, salt, verifier);
        const privateState = terminate_server.toPrivateStoreState();
        const cacheJson = JSON.stringify(privateState);

        cache.put(username, cacheJson, function (err) {
          if (err) throw err
        })



        var response = { salt: result.salt, B: B };

        res.send(JSON.stringify(response));
      }
    })
  }
});

app.post('/authenticate', EParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  const creds = req.body.credentials

  if (typeof creds === 'undefined') {
    return res.sendStatus(400);
  } else {
    const pass_key = JSON.parse(creds)
    const user_name = pass_key.username
    const A = pass_key.A
    const M1 = pass_key.M1
    db.get(user_name, { asBuffer: false }, function (err, value) {
      if (err) {

        return res.sendStatus(204)
      } else {
        res.setHeader('Content-Type', 'application/json');

        const result = JSON.parse(value);

        const var_salt = result.salt;
        const var_verifier = result.verifier;

        cache.get(user_name, { asBuffer: false }, function (err, cacheJson) {
          if (err) {
            return res.sendStatus(403)
          } else {

            const newPrivate = JSON.parse(cacheJson);
            var_server = new Session();
            var_server.fromPrivateStoreState(newPrivate);


            try {
              var M2 = var_server.step2(A, M1)
              console.log("shared key: " + var_server.getSessionKey())
              // store this key in a DB
              var string = encodeURIComponent(M2)

              const fs = require("fs");

              const filename = "keys.txt";
              const content = user_name + " " + var_server.getSessionKey() + '\n';

              // open the file for writing
              fs.open(filename, "a+", (err, fd) => {
                if (err) throw err;

                // write the content to the file
                fs.write(fd, content, (err) => {
                  if (err) throw err;

                  // close the file
                  fs.close(fd, (err) => {
                    if (err) throw err;
                    console.log("File written successfully.");
                  });
                });
              });



              res.redirect('/home?username=' + user_name + '&M2=' + string);
            } catch (e) {
              return res.sendStatus(403)
            }
          }
        })
      }
    })
  }
});

app.get('/home', function (req, res) {
  const username = req.query.username
  res.send('Welcome ' + username + ' authentication success!');
});

var var_server = app.listen(8080, function () {
  console.log('Node has started on port 8080');
});

exports.closeServer = function () {
  var_server.close();
}