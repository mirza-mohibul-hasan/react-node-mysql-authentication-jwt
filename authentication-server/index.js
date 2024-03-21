const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();
const port = 8000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

// database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "react_node_authenticationDB",
});
db.connect(function (err) {
  if (err) throw err;
  console.log("Database is connected successfully !");
});
// default
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.listen(port, () => {
  console.log("Server is running");
});

// Working Zones
// JWT Verification
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("We need a token, please give it to us next time");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        console.log(err);
        res.json({ auth: false, message: "Auth Failed" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};
app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send("You are authenticated Congrats:");
});

const saltRound = 10;

app.post("/register", (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;
  bcrypt.hash(password, saltRound, (err, hash) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "INSERT INTO users (`username`, `password`, `role`) VALUES(?, ?, ?)",
      [username, hash, "general"],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("An error occurred while registering the user.");
        } else {
          res.status(200).send(result);
        }
      }
    );
  });
});

app.post("/login", (req, res) => {
  console.log("Login");
  const username = req.body?.username;
  const password = req.body?.password;
  db.query(
    "SELECT * FROM users where username=?;",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            const id = result[0].id;
            const token = jwt.sign({ id }, "jwtSecret", {
              expiresIn: 300,
            });
            req.session.user = result;
            res.status(200).send({ auth: true, token, result });
          } else {
            res.json({ auth: false, message: "Wrong username password" });
          }
        });
      } else {
        res.json({ auth: false, message: "no user exists" });
      }
    }
  );
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Logout failed");
    } else {
      res.clearCookie("userId");
      res.status(200).send("Logout successful");
    }
  });
});
