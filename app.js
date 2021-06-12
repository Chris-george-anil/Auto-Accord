const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const findOrCreate = require("mongoose-findorcreate");
const path = require("path");
const csv = require('csv-parser');
const fs = require('fs');
const pdf = require("html-pdf");

var send;
var x;
const rounds = 10;
var email;
var name;
var phonenum;
var address;
var carname;
var seller;
var owner;
var transmission;
var fuel;
var details;
var username;
var top;
var found;
var filters = ["name", "year", "selling_price", "km_driven", "fuel", "seller_type", "transmission", "owner",
  "mileage", "engine", "max_power", "torque", "seats"
];
var cars = [];
mongoose.connect('mongodb://localhost:27017/IWP', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const UserSchema = new mongoose.Schema({
  Email: String,
  Name: String,
  PhoneNum: Number,
  Password: String,
  Address: String
});

const SellSchema = new mongoose.Schema({
  Customer: String,
  Model: String,
  RcNo: Number,
  VehicleNo: String
});

const User = new mongoose.model("User", UserSchema);
const Sell = new mongoose.model("Sell", SellSchema);

const Cardetails = mongoose.model('cardetail',
  mongoose.Schema({
    name: String,
    km_driven: Number,
    fuel: String,
    selling_price: Number,
    year: Number,
    seller_type: String,
    transmission: String,
    owner: String,
    mileage: String,
    engine: String,
    max_power: String,
    seats: Number
  }),
  'cardetail');
// Cardetails.find({"km_driven":45000},function(err,found){
//   console.log(found);
// });

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyparser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  res.render("index");
});
app.get("/login", function(req, res) {
  res.render("login");
});
app.get("/home", function(req, res) {
  res.render("home", {
    name: username
  });
});
app.get("/signup", function(req, res) {
  res.render("signup");
});
app.get("/buycars", function(req, res) {
  res.render("buycars", {
    items: cars
  });
});
app.get("/sellcars", function(req, res) {
  res.render("sellcars");
});
app.get("/result", function(req, res) {
  res.render("result");
})
app.get("/sellpage", function(req, res) {
  res.render("sellpage");
});


app.get("/buff/:top", function(req, res) {

  Cardetails.findOne({"_id":req.params.top }, function(err, found) {
    //  send=[{"name": found.name,"km_driven": found.km_driven,
    //   fuel: found.fuel,
    //   selling_price: found.selling_price,
    //   year: found.year,
    //   seller_type: found.seller_type,
    //   transmission: found.transmission,
    //   owner: found.owner,
    //   mileage: found.mileage,
    //   engine: found.engine,
    //   max_power: found.max_power,
    //   seats: found.seats
    // }];
send=found;
    console.log("send",found);
      });
   ejs.renderFile(path.join(__dirname + '/views/', "template.ejs"), {
      r: send
    }, (err, data) => {
      if (err) {
        console.log("senderr",send);

        console.log(err);
      } else {
        let options = {
          "height": "12.5in",
          "width": "8.5in",
          "header": {
            "height": "10mm",
          },
          "footer": {
            "height": "5mm",
          },

        };
        pdf.create(data,
          options).toFile("./views/report.pdf", function(err, data) {
          if (err) {
console.log(err);
          } else {
            res.render("details");
          }
        });
      }
    });
});


app.get("/report.pdf",function(req,res){
  res.sendFile("/Users/Chris george anil/Desktop/College/IWP/IWP-Project/views/report.pdf",function(err){
    if(err){
      console.log(err);
    }else{
      console.log("done");
    }
  });
});

app.get("/thanks",function(req,res){
  res.render("thanks");
});

app.get("/sales",function(req,res){
  res.render("sales");
});

app.get("/sales_report.pdf",function(req,res){
  res.sendFile("/Users/Chris george anil/Desktop/College/IWP/IWP-Project/views/sales_report.pdf",function(err){
    if(err){
      console.log(err);
    }else{
      console.log("done sales_report");
    }
  });
});

app.post("/signup", function(req, res) {
  const pass = req.body.password;
  username = req.body.name;
  bcrypt.hash(pass, rounds, function(err, hash) {
    const newuser = new User({
      Email: req.body.email,
      Name: req.body.name,
      PhoneNum: req.body.phone,
      Password: hash,
      Address: req.body.address
    });
    newuser.save(function(err) {
      if (err) {
        console.log(err);
      } else {

        res.render("home", {
          name: username
        });
      }
    })
  })
})

app.post("/login", function(req, res) {
  phonenum = req.body.phone;
  const pas = req.body.password;
  username = req.body.name;
  User.findOne({
    "PhoneNum": phonenum
  }, function(err, found) {
    if (!err) {
      if (found) {
        bcrypt.compare(pas, found.Password, function(err, result) {
          if (result === true) {
            username = found.Name;
            emailid = found.Email;
            address = found.Address;
            phonenom = found.PhoneNum;
            res.render("home", {
              name: username
            });
          } else {
            console.log("Wrong Password");
          }
        })
      }
    }
  });
})

app.post("/sellcars", function(req, res) {

  fs.createReadStream(__dirname + '/cars.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (req.body.name == row["names"]) {
        carname = row["sno"];
        console.log(carname);
      }
    })
    .on('end', () => {
      if (req.body.seller == "Individual") {
        seller = 1
      } else {
        seller = 2
      }

      if (req.body.transmission == "Manual") {
        transmission = 1
      } else {
        transmission = 2
      }

      if (req.body.fuel == "Petrol") {
        fuel = 1;
      } else {
        fuel = 2;
      }
      console.log(carname);

      details = [carname, req.body.kms, seller, fuel, transmission, req.body.owner, req.body.years, req.body.seats];
      console.log(details);
      res.render("result", {
        details: details
      });
    });
});

app.post("/buycars", function(req, res) {
  var value = req.body.val;
  // var filt = filters[filters.findIndex(req.body.Filter)];
  var query = {};
  query[req.body.Filter] = value;
  Cardetails.find(query, function(err, found) {
    cars = found;
    res.render("buycars", {
      items: cars
    });
  })
});

app.post("/sellpage",function(req,res){
  var got=[req.body.Customer,req.body.model,req.body.RC,req.body.vehicleno,req.body.vimage];
  ejs.renderFile(path.join(__dirname + '/views/', "sales_template.ejs"), {
     r: got
   }, (err, data) => {
     if (err) {
       console.log("senderr",got);

       console.log(err);
     } else {
       let options = {
         "height": "11.25in",
         "width": "8.5in",
         "header": {
           "height": "20mm",
         },
         "footer": {
           "height": "20mm",
         },

       };
       pdf.create(data,
         options).toFile("./views/sales_report.pdf", function(err, data) {
         if (err) {
console.log(err);
         } else {
           console.log("senderr",got);

           res.render("sales");
         }
       });
     }
   });
})



app.listen(3000, function(err) {
  console.log("Started");
});
