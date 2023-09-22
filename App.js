var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const bcrypt = require('bcrypt')
const saltRounds = 10
var jwt = require('jsonwebtoken')
const secret = 'Fullstack-login'

app.use(cors())

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'mydv'
});

app.post('/register', jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    connection.execute(
      'INSERT INTO users (email, password, fname, lname) VALUES (?, ?, ?, ?)',
      [req.body.email, hash, req.body.fname, req.body.lname],
      function (err, results, fields) {
        if (err) {
          res.json({ status: 'error', message: err })
          return
        }
        res.json({ status: 'Ok' })
      }
    );
  });

  //res.json({msg: 'Hello World'})
})

app.post('/login', jsonParser, function (req, res, next) {
  connection.execute(
    'SELECT * FROM users WHERE email=?',
    [req.body.email],
    function (err, users, fields) {
      if (err) {
        res.json({ status: 'error', message: err });
        return
      }
      if (users.length == 0) { res.json({ status: 'error', message: 'no user found' }); return }
      bcrypt.compare(req.body.password, users[0].password, function (err, isLogin) {
        if (isLogin) {
          var token = jwt.sign({ email: users[0].email }, secret, { expiresIn: '1h' });
          res.json({ status: 'ok', massage: 'login success', token })
        } else {
          res.json({ status: 'error', massage: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
        }
        // result == true
      });
    }
  );
})

app.post('/authen', jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    var decoded = jwt.verify(token, secret);
    res.json({ status: 'ok', decoded })

  } catch (err) {
    res.json({ status: 'error', message: err.message })

  }

})

app.get('/todos', jsonParser, function (req, res, next) {
  connection.query(
    'SELECT * FROM `todolist`',
    function (err, results, fields) {
      res.json(results);
      console.log(results);
      console.log(fields);
    }
  );
})

app.get('/todos/:id', jsonParser, function (req, res, next) {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM `todolist` WHERE `id` = ?',
    [id],
    function (err, results) {
      res.json(results);
      console.log(results);
    }
  );
})

app.post('/todos', jsonParser, function (req, res, next) {
  const id = req.params.id;
  connection.query(
    'INSERT INTO `todolist` (`title`, `description`) VALUES (?, ?)',
    [req.body.title, req.body.description],
    function (err, results) {
      res.json(results);
    }
  );
})

app.put('/todos', jsonParser, function (req, res, next) {
  const id = req.params.id;
  connection.query(
    'UPDATE `todolist` SET `title`=?, `description`=? WHERE id = ?',
    [req.body.title, req.body.description, req.body.id],
    function (err, results) {
      res.json(results);
    }
  );
})

app.delete('/todos', jsonParser, function (req, res, next) {
  connection.query(
    'DELETE FROM `todolist` WHERE id = ?',
    [req.body.id],
    function (err, results) {
      res.json(results);
    }
  );
})

app.listen(3333, function () {
  console.log('CORS-enabled web server listening on port 3333')
})