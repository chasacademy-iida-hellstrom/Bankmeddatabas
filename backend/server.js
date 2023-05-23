import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql";

const app = express();


app.use(cors());

app.use(bodyParser.json());

const PORT = 4001;
const SECRET = "fosjguerhgrj";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "swedbank",
});

//const users = [];
//const accounts = [];
//let userIds = 1;
  //{
  //"username": "hej",
  //"password": "123",
 // "id": 1
//}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("req.headers", req.headers);
  console.log("authHeader", authHeader)
  console.log("token", token)

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, userId) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.userId = userId;

    next();
  });
}



app.post("/users", (req, res) => {
  const user = req.body;
  //user.id= userIds++;
  //users.push(user);

  db.query("INSERT INTO users (username, password) VALUES (?, ?)", 
  [user.username, user.password], (err, results) => {
  console.log('result register', results)
  const insertId = results.insertId;

  db.query("INSERT INTO accounts (user_id, amount) VALUES (?, ?)", 
  [insertId, 200], (err, results) => {
  console.log('result register', results)
  if (err) {
      res.sendStatus(500)
  } else {
      res.send('ok')
  }
  }
)




  console.log(err);
  // if (err) {
  //     res.sendStatus(500)
  // } else {
  //     res.send('ok')
  // }
  }
)

  // console.log("req body: " + user.username + " " + user.password );

  // const account = 
  // {
  //   money: "100",
  //   userId: user.id,
  // };

  // accounts.push(account);
  

 // res.statusCode = 200;
 // res.send("ok");
});

app.post("/sessions", (req, res) => {

  const user = req.body;
  // const dbUser = users.find((userEl)=> {
  //   if(userEl.username == user.username){
  //     return userEl
  //   }
  // })
  db.query("SELECT * FROM users WHERE username = ?", [user.username], (err, results) => {
    if (err) {
        res.sendStatus(500)
    } else {
       const dbUser = results[0];
       console.log(dbUser);

      if(dbUser.password === user.password ){
        const token = jwt.sign(dbUser.id, SECRET)
        console.log(token);
        res.json(token);
      }

    }
  })


 
});

app.get("/me/accounts", authenticateToken, (req, res) => {
  
  //const myAccount = accounts.find((acc) => acc.userId == req.userId);
  db.query("SELECT * FROM accounts WHERE user_id = ?", [req.userId], (err, results) => {
    if (err) {
        res.sendStatus(500)
    } else {
      const myAccount =results[0];
      console.log(myAccount);
      res.json(myAccount);
    }
  })
  



});




app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
