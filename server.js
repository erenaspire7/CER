const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser");
const MongoClient = require("mongodb").MongoClient;
const nodemailer = require("nodemailer");

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

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yusuffjamal3@gmail.com",
    pass: "hvyccurmwebkqeyv",
  },
});

// nodemailer.createTransport({})
MongoClient.connect(connectionString, {
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to DB");

    const db = client.db("CER");
    const membersTable = db.collection("Members");

    app.get("/inform", (req, res) => {
      data = {
        ref_no: req.query.ref_no,
        amount: req.query.amount,
        member_num: req.query.member_num,
      };

      let update = {
        from: "inform@lesothocer.org",
        to: "lesothocer@gmail.com",
        subject: "Pay Confirmed!",
        text: `Ref No: ${data.ref_no}\nAmount: ${data.amount}\nPhone Number: ${data.member_num}`,
      };

      mailTransporter.sendMail(update, function (err, data) {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
          res.redirect("/");
        }
      });
    });

    app.post("/send", (req, res) => {
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
          res.render("pay.ejs", { values: membership_details });
        })
        .catch((err) => console.log(err.message));
    });

    app.post("/contact", (req, res) => {
      let contact_details = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
      };

      const mailDetails = {
        from: `${contact_details.name}, <${contact_details.email}>`,
        to: "lesothocer@gmail.com",
        subject: contact_details.subject,
        text: `Name: ${contact_details.name}.\n Email: ${contact_details.email}\n\n ${contact_details.message}`,
      };

      // console.log(mailDetails.from);
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log("Error Occurs");
          console.log(err.message);
        } else {
          console.log("Email sent successfully");
          res.redirect("email_sent.html");
        }
      });
    });

    const server = app.listen(PORT, () => {
      const host = server.address().address;
      const port = server.address().port;

      console.log("Example app listening at http://%s:%s", host, port);
    });
  })
  .catch((err) => console.log(err.message));
