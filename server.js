// server.js
var database_uri = 'mongodb+srv://Cmojica90:2DJhikJJJCYQCzA@practfreecodecamp.togcm.mongodb.net/practfreecodecamp?retryWrites=true&w=majority'
// where your node app starts

// init project
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var express = require('express');
var multer = require("multer");
var app = express();
const Schema = mongoose.Schema;
mongoose.connect(database_uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

//Rutas de acceso a los distintos proyectos de FreeCodeCamp
app.get("/proyecto_1", function (req, res) {
  res.sendFile(__dirname + '/views/proyecto_1.html');
});
app.get("/proyecto_2", function (req, res) {
  res.sendFile(__dirname + '/views/proyecto_2.html');
});
app.get("/proyecto_3", function (req, res) {
  res.sendFile(__dirname + '/views/proyecto_3.html');
});
app.get("/proyecto_4", function (req, res) {
  res.sendFile(__dirname + '/views/proyecto_4.html');
});
app.get("/proyecto_5", function (req, res) {
  res.sendFile(__dirname + '/views/proyecto_5.html');
});

//PROYECTO NO 1  Microservicio de marca de tiempo
app.get("/api", function (req, res) {
  var now = new Date();
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  });
});
app.get("/api/:date_string", function (req, res) {
  let dateString = req.params.date_string;
  if (parseInt(dateString) > 10000) {
    let newValidate = new Date(parseInt(dateString));
    res.json({
      "unix": newValidate.getTime(),
      "utc": newValidate.toUTCString()
    });
  }
  let validate = new Date(dateString);
  if (validate == "Fecha Invalida") {
    res.json({ "error": 'Fecha Invalida' });
  } else {
    res.json({
      "unix": validate.getTime(),
      "utc": validate.toUTCString()
    });
  }
});

// FIN PROYECTO NO 1  Microservicio de marca de tiempo

//PROYECTO NO 2  Microservicio de analizador de solicitud de encabezado
app.get("/api/whoami", function (req, res) {
  /* res.send(req); */ // => 8.8.8.8//con esto verificamos lo que se esta enviando en el request
  console.log(req);
  let software = req.conecction.remoteAddress;//otra manera 
  let language = req.headers["acent-language"];//otra manera
  let ip = req.headers["user-agent"];;//otra manera

  /* 
  let software = req.conecction.remoteAddress;//otra manera 
  let language = req.headers["acent-language"];//otra manera
  let ip = req.headers[user-agent];//otra manera
  */
  //console.log(software);
  //console.log(language);
  //console.log(ip);
  res.json({
    "ipaddress": ip,
    "language": language,
    "software": software
  });

});
//FIN PROYECTO NO 2  Microservicio de analizador de solicitud de encabezado
// your first API endpoint...
/* app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});
 */
//PROYECTO NO 3  Microservicio acortador de URL
const ShortUrl = mongoose.model("ShortUrl", new Schema({
  original_url: String,
  short: Number
}));

let responseObject = {};
app.post('/api/shorturl', function (req, res) {
  let inputUrl = req.body.url
  /*
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

if(!inputUrl.match(urlRegex)){
 return res.json({error: 'invalid url'})
}*/
  const httpRegex = /^(http|https)(:\/\/)/;
  if (!httpRegex.test(inputUrl)) {
    return res.json({ error: 'invalid url' })
  }

  responseObject['original_url'] = inputUrl
  let inputShort = 1;
  ShortUrl
    .findOne({})
    .sort({ short: "desc" })
    .exec((err, result) => {
      if (!err && result != undefined) {
        inputShort = result.short + 1;
      }
      if (!err) {
        ShortUrl.findOneAndUpdate(
          { original_url: inputUrl },
          { original_url: inputUrl, short: inputShort },
          { new: true, upsert: true },
          (err, savedUrl) => {
            if (!err) {
              responseObject["short_url"] = savedUrl.short;
              res.json(responseObject);
            }
          }
        );
      }
    });
});
/*
app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.short;
  
  ShortUrl.findOne({short: input}, (err, result) => {
    if(!err && result != undefined){
      res.redirect(result.original_url)
    }else{
      response.json('URL not Found')
    }
  })
});*/

app.get('/api/shorturl/:short', function (req, res) {
  let newLink = req.params.short;
  ShortUrl.find({ short: newLink }).then(function (foundUrls) {
    let urlRedirect = foundUrls[0];
    res.redirect(urlRedirect.original_url);
  })
});
//FIN PROYECTO NO 3  Microservicio acortador de URL


//PROYECTO NO 4  Rastreador de ejercicios
const NewUser = mongoose.model("NewUser", new Schema({
  username: { type: String, unique: true }
}));

const NewExrcises = mongoose.model("NewExrcises", new Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
}));

app.post("/api/users", function (req, res) {
  let newReg = new NewUser({
    username: req.body.username
  });
  newReg.save(function (err, doc) {
    if (err || !doc) return console.error(err);
    res.json({
      "username": req.body.username,
      "_id": newReg["_id"]
    });
  });
});
/*
app.post("/api/users", function(req, res){
NewUser.find({"username": req.body.username}, (err, userData)=>{
  if(err){
    console.log(err);
  }else{
    if (userData.lenght===0){
       let newReg= new NewUser({
       username: req.body.username
  });
 newReg.save(function(err, doc) {
  if (err) return console.error(err);
    res.json({
    "username": req.body.username,
    "_id" : newReg["_id"]
   });
 });
    }else{
      //console.log("Usuario registrado, Intente otro");
      res.json({ 
        mensaje: "Usuario registrado, Intente otro"
      })
    }
  }
})
 


});*/
app.post("/api/users/:_id/exercises", (req, res) => {
  let id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  if (!date) {
    date = new Date();
    date.getTime();
  }
  NewUser.findById(id, (err, userData) => {
    if (err || !userData) {
      res.send("Usuario no registrado");
    } else {
      let newExrcises = new NewExrcises({
        userId: id,
        description,
        duration,
        date: new Date(date)
      });
      newExrcises.save((err, data) => {
        if (err || !data) {
          res.send("Error al guardar la información");
        } else {
          let { description, duration, date, _id } = data;
          res.json({
            _id: userData.id,
            username: userData.username,
            date: date.toDateString(),
            duration,
            description
          })
        }
      })
    }
  })
});
app.get("/api/users/:_id/logs", (req, res) => {
  let { from, to, limit } = req.query;
  let id = req.params._id;
  NewUser.findById(id, (err, userData) => {
    if (err || !userData) {
      res.send("Usuario no registrado");
    } else {
      let dateObj = {}
      if (from) {
        dateObj["$gte"] = new Date(from)//
      }
      if (to) {
        dateObj["$lte"] = new Date(to)//
      }
      let filter = {
        userId: id
      }
      if (from || to) {
        filter.date = dateObj
      }
      NewExrcises.find(filter).limit(limit).exec((err, data) => {
        if (err || !data) {
          res.json("NO hay información que mostrar")
        } else {
          const count = data.length;
          const rawLog = data;
          const { username, _id } = userData;
          const log = rawLog.map((item) => ({
            description: item.description,
            duration: item.duration,
            date: item.date.toDateString()
          }))
          res.json({ _id, username, count, log })
        }
      })
    }
  })
})
app.get("/api/users", (req, res) => {
  NewUser.find({}, (err, allUsers) => {
    res.json(allUsers);
  })
});
//FIN PROYECTO NO 4  Rastreador de ejercicios

//PROYECTO NO 5  Microservicio de metadatos de archivo
var storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage })

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const file = req.file
  if (!file) {
    res.send("No se ha cargado ningun archivo, intentalo de nuevo.");
  } //res.send(file);
  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size
  })

})
//FIN PROYECTO NO 5  Microservicio de metadatos de archivo

// listen for requests :)
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
