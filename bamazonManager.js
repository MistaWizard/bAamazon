require("dotenv").config();

// Our requirements
const keys = require("./keys.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require('colors');
const Table = require("cli-table");

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

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    startPrompt();
});

function startPrompt() {
    inquirer.prompt([
        {
            type: "list",
            name: "actions";
            message: "Welcome Michael Scott. What would you like to review?",
            choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product"]
        }
    ]).then(function(user) {
        if (user.actionList === "View Products For Sale") {
            inventory();
        } else if (user.actionList === "View Low Inventory") {
            lowInventory();
        } else if (user.actionList === "Add To Inventory") {
            addInventory();
        } else {
            addProduct();
        }
    });
};

function inventory() {
    let query = "Select * FROM products";
    let table = new Table ({
		head: ["Item ID".blue, "Product Name".blue, "Catergory".blue, "Price".blue, "Quantity".blue],
		colWidths: [10,25,25,10,14]
	});
	connection.query(query, function(err, res){
		if (err) throw err;
		for (var i = 0; i < res.length; i++){
			table.push(
				[res[i].item_id,res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
			);
		}
        console.log("");
        console.log("********************************** Current bAmazon Inventory **********************************".yellow);
        console.log("");
        console.log(table.toString());
        console.log("");
		continuePrompt();
	});
};

function lowInventory() {
    let query = "Select * FROM products WHERE stock_quantity < 5";
    let table = new Table ({
		head: ["Item ID".blue, "Product Name".blue, "Catergory".blue, "Price".blue, "Quantity".blue],
		colWidths: [10,25,25,10,14]
    });
	connection.query(query, function(err, res){
		if (err) throw err;
		for (var i = 0; i < res.length; i++){
			table.push(
				[res[i].item_id,res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
			);
		}
        console.log("");
        console.log("********************************** Low Inventory Items **********************************".yellow);
        console.log("");
        console.log(table.toString());
        console.log("");
		continuePrompt();
	});
};

function addInventory() {
    inquirer.prompt([
        {
            type: "input",
            name: "inputId",
            message: "Please enter the ID number of the item you would like to add inventory to.",
        },
        {
            type: "input",
            name: "inputNumber",
            message: "How many units of this item would you like to have in the in-store stock quantity?",
        }
    ]).then(function(managerAdd) {

          connection.query("UPDATE products SET ? WHERE ?", [{

              stock_quantity: managerAdd.inputNumber
          }, {
              item_id: managerAdd.inputId
          }], function(err, res) {
          });
      startPrompt();
    });
};

function addProduct() {

    //ask user to fill in all necessary information to fill columns in table
    
        inquirer.prompt([
            {
                type: "input",
                name: "inputName",
                message: "Please enter the item name of the new product.",
            },
            {
                type: "input",
                name: "inputDepartment",
                message: "Please enter which department name of which the new product belongs.",
            },
            {
                type: "input",
                name: "inputPrice",
                message: "Please enter the price of the new product (0.00).",
            },
            {
                type: "input",
                name: "inputStock",
                message: "Please enter the stock quantity of the new product.",
            }
        ]).then(function(managerNew) {
    
          //connect to database, insert column data with input from user
    
        connection.query("INSERT INTO products SET ?", {
            product_name: managerNew.inputName,
            department_name: managerNew.inputDepartment,
            price: managerNew.inputPrice,
            stock_quantity: managerNew.inputStock
        }, function(err, res) {});
        startPrompt();
    });
};