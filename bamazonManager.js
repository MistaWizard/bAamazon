require("dotenv").config();

// Our requirements
const keys = require("./keys.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require('colors');
const Table = require("cli-table");

const pwd = keys.mysqlDB.password;

// Database Setup
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

// Validate any whole number inputs
function validateInteger(value) {
	let integer = Number.isInteger(parseFloat(value));
	let sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
};

// Validate any positive number inputs
function validateNumeric(value) {
	let number = (typeof parseFloat(value)) === 'number';
	let positive = parseFloat(value) > 0;

	if (number && positive) {
		return true;
	} else {
		return 'Please enter a positive number for the unit price.'
	}
};

// Connect to our database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    startPrompt();
});

// This begins our user interaction
function startPrompt() {
    inquirer.prompt([
        {
            type: "list",
            name: "actions",
            message: "Welcome Michael Scott. What would you like to review?",
            choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product"]
        }
    ]).then(function(user) {
        if (user.actions === "View Products For Sale") {
            inventory();
        }
        else if (user.actions === "View Low Inventory") {
            lowInventory();
        }
        else if (user.actions === "Add To Inventory") {
            addInventory();
        }
        else if (user.actions === "Add New Product") {
            addProduct();
        }
    });
};

// Displays inventory for the user
function inventory() {
    let query = "Select * FROM products";
    let table = new Table ({
		head: ["Item ID".blue, "Product Name".blue, "Catergory".blue, "Price".blue, "Quantity".blue],
		colWidths: [10,25,25,10,14]
	});
	connection.query(query, function(err, res){
		if (err) throw err;
		for (let i = 0; i < res.length; i++){
			table.push(
				[res[i].item_id,res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
			);
		}
        console.log("");
        console.log("********************************** Current bAmazon Inventory **********************************".yellow);
        console.log("");
        console.log(table.toString());
        console.log("");
		startPrompt();
	});
};

// Displays low (below 5) inventory for the user
function lowInventory() {
    let query = "Select * FROM products WHERE stock_quantity < 5";
    let table = new Table ({
		head: ["Item ID".blue, "Product Name".blue, "Catergory".blue, "Price".blue, "Quantity".blue],
		colWidths: [10,25,25,10,14]
    });
	connection.query(query, function(err, res){
		if (err) throw err;
		for (let i = 0; i < res.length; i++){
			table.push(
				[res[i].item_id,res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
			);
		}
        console.log("");
        console.log("********************************** Low Inventory Items **********************************".yellow);
        console.log("");
        console.log(table.toString());
        console.log("");
		startPrompt();
	});
};

// Adds more inventory for an existing item
function addInventory() {
    inquirer.prompt([
        {
            type: "input",
            name: "inputId",
            message: "Please enter the ID number of the item you would like to add inventory to.",
            validate: validateInteger,
            filter: Number
        },
        {
            type: "input",
            name: "inputNumber",
            message: "How many units of this item would you like to have in the in-store stock quantity?",
            validate: validateInteger,
            filter: Number
        }
    ]).then(function(managerAdd) {
        let query = "UPDATE products SET ? WHERE ?";
        connection.query(query, [{stock_quantity: managerAdd.inputNumber}, {item_id: managerAdd.inputId}], function(err, res) {
            if (err) throw err;
            console.log("Inventory Added");
        });
        startPrompt();
    });
};

// Adds a new item to the database
function addProduct() {
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
            validate: validateNumeric
        },
        {
            type: "input",
            name: "inputStock",
            message: "Please enter the stock quantity of the new product.",
            validate: validateInteger,
            filter: Number
        }
    ]).then(function(managerNew) {
        let query = "INSERT INTO products SET ?";
        connection.query(query, {
            product_name: managerNew.inputName,
            department_name: managerNew.inputDepartment,
            price: managerNew.inputPrice,
            stock_quantity: managerNew.inputStock
            }, function(err, res) {
            if (err) throw err;
            console.log("Inventory Added");
        });
        startPrompt();
    });
};