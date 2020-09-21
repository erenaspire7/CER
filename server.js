const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser");
const MongoClient = require("mongodb").MongoClient;

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

const connectionString =
  "mongodb+srv://admin:admin@cer.4g7j9.mongodb.net/CER?retryWrites=true&w=majority";

MongoClient.connect(connectionString, {
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to DB");

    const db = client.db("CER");
    const membersTable = db.collection("Members");

    app.get("/send", (req, res) => {
      let currentDate = new Date();

      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      let membership_details = {
        member_surname: req.body.surname,
        member_first_name: req.body.first_name,
        member_id: req.body.id_num,
        member_gender: req.body.gender,
        member_address: req.body.residential_address,
        member_constituency: req.body.constituency,
        member_district: req.body.district,
        member_cell: req.body.cell,
        member_occupation: req.body.occupation,
        member_joined:
          currentDate.getDate() +
          " " +
          months[currentDate.getMonth()] +
          ", " +
          currentDate.getFullYear(),
        member_renew_date:
          currentDate.getDate() +
          " " +
          months[currentDate.getMonth()] +
          ", " +
          (currentDate.getFullYear() + 1),
        amount_paid: req.body.amount,
      };


      membersTable
        .insertOne(membership_details)
        .then(() => {
          // res.render('pay.ejs', {values: membership_details});
          res.redirect('/');
        })
        .catch((err) => console.log(err.message));
    });
    var server = app.listen(PORT, () => {
      var host = server.address().address;
      var port = server.address().port;

      console.log("Example app listening at http://%s:%s", host, port);
    });
  })
  .catch((err) => console.log(err.message));
