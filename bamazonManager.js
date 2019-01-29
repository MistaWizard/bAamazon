require("dotenv").config();

// Our requirements
const keys = require("./keys.js");
const mysql = require("mysql");
const inquirer = require("inquirer");

const pwd = keys.mysqlDB.password;

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: pwd,
  database: "bamazon"
});