const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

const db_host = process.env.HOST;
const db_user = process.env.USER;
const db_pass = process.env.PASS;
const db_database = process.env.DATABASE;

const apiBase = process.env.API_BASE;

// Function to create a database connection
function createConnection() {
  return mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_pass,
    database: db_database,
  });
}

// Use the cors middleware to allow any origin
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Middleware to handle database connection for each request
app.use(async (req, res, next) => {
  req.db = createConnection();
  await req.db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ', err);
      return res.status(500).send('Database connection error');
    }
    next();
  });
});


// Create
app.post(`${apiBase}`, async (req, res) => {
    const {datareuniaoStr, dirigidapor, presididapor, primeiro_hino, primeira_oracao, mensagem, ultima_oracao, numero, anuncio, observacao, primeiro_hino_nome, regras_de_fe_str, tipo_hinario} = req.body;

  const sql = 'INSERT INTO reuniao (datareuniao, dirigidapor, presididapor, primeiro_hino, primeira_oracao, mensagem, ultima_oracao, numero, anuncio, observacao, primeiro_hino_nome, regras_de_fe, tipo_hinario) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  try{
    await req.db.query(sql, [datareuniaoStr, dirigidapor, presididapor, primeiro_hino, primeira_oracao, mensagem, ultima_oracao, numero, anuncio, observacao, primeiro_hino_nome, regras_de_fe_str, tipo_hinario], (err, result) => {
      if (err) {
        console.error('Error creating meeting: ', err);
        res.status(500).send({message: 'Error creating meeting'});
      } else {
        res.status(201).json({Id: result.insertId});
      }
    });
  }
  catch(ex){
    res.status(500).send({message: ex});
  }
});

app.put(`${apiBase}:id`, async (req, res) => {
    const id = req.params.id;
    const {dirigidapor, presididapor, primeiro_hino, primeira_oracao, mensagem, ultima_oracao, numero, anuncio, observacao, primeiro_hino_nome, regras_de_fe_str, tipo_hinario} = req.body;
    const sql = 'UPDATE reuniao SET dirigidapor = ?, presididapor = ?, primeiro_hino = ?, primeira_oracao = ?, mensagem = ?, ultima_oracao = ?, numero = ?, anuncio = ?, observacao = ?, primeiro_hino_nome = ?, modifiedon = ?, regras_de_fe = ?, tipo_hinario = ? WHERE Id = ?';

    const modifiedon = new Date();

    try{
      await req.db.query(sql, [dirigidapor, presididapor, primeiro_hino, primeira_oracao, mensagem, ultima_oracao, numero, anuncio, observacao, primeiro_hino_nome, modifiedon, regras_de_fe_str, tipo_hinario, id], (err, result) => {
        if (err) {
          console.error('Error getting meeting: ', err);
          res.status(500).send({message: 'Error getting meeting'});
        } else {
          res.status(200).json(result[0]);
        }
      });
    }
    catch(ex){
      res.status(500).send({message: ex});
    }
  });

// Read (List all meetings)
app.get(`${apiBase}listAll`, async (req, res) => {
  const sql = 'SELECT * FROM reuniao order by numero desc;';
  
  try{
    await req.db.query(sql, (err, result) => {
      if (err) {
        console.error('Error listing meetings: ', err);
        res.status(500).send({message: 'Error listing meetings'});
      } else {
        res.status(200).json(result);
      }
    });
  }
  catch(ex){
    res.status(500).send({message: ex});
  }
});

app.get(`${apiBase}nextMeetingNumber`, async (req, res) => {
  const sql = 'select numero+1 as numero from reuniao order by numero desc limit 1';
  
  try{
    await req.db.query(sql, (err, result) => {
    if (err) {
      console.error('Error listing meetings: ', err);
      res.status(500).send({message: 'Error listing meetings'});
    } else {
      res.status(200).json(result[0]);
    }
  });
  }
  catch(ex){
    res.status(500).send({message: ex});
  }
});

app.get(`${apiBase}:id`, async (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM reuniao WHERE Id = ?';

  try{
    await req.db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error getting meeting: ', err);
        res.status(500).send({message: 'Error getting meeting'});
      } else {
        res.status(200).json(result[0]);
      }
    });
  }
  catch(ex){
    res.status(500).send({message: ex});
  }
});

app.get(`${apiBase}getByDate/:Date`, async (req, res) => {
  const date = req.params.Date;
  const sql = 'SELECT * FROM reuniao WHERE date(datareuniao) = ?';
  console.log(date);

  try{
    await req.db.query(sql, [date], (err, result) => {
      if (err) {
        console.error('Error getting meeting: ', err);
        res.status(500).send({message: 'Error getting meeting'});
      } else {
        res.status(200).json(result[0]);
      }
    });
  }
  catch(ex){
    res.status(500).send({message: ex});
  }
});

// Delete
app.delete(`${apiBase}:id`, async (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM reuniao WHERE Id = ?';

  try{
    await req.db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error deleting meeting: ', err);
        res.status(500).send({message: 'Error deleting meeting'});
      } else {
        res.status(200).send({message: 'Meeting deleted successfully'});
      }
    });
  }
  catch(ex){
    res.status(500).send(ex);
  }
});

app.listen(port, () => {
  console.log(`db.reuniaofamiliar v0.0.2 - ${port}`);
});
