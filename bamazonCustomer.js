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

// Validate any number inputs
function validateInput(value) {
	let integer = Number.isInteger(parseFloat(value));
	let sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
    }
    else {
		return 'Please enter a whole non-zero number.';
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
            type: "confirm",
            name: "confirm",
            message: "Welcome to bAmazon! Would you like to view our inventory?",
            default: true
        }
    ]).then(function(userStart) {
        if (userStart.confirm === true) {
            inventory();
        }
        else {
            console.log("Thank you! Come back soon!");
            process.exit();
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
		continuePrompt();
	});
};

// Ask user to continue or exit
function continuePrompt() {
    inquirer.prompt([
        {
            type: "confirm",
            name: "continue",
            message: "Would you like to purchase an item?",
            default: true
        }
    ]).then(function(userContinue) {
        if (userContinue.continue === true) {
            selectionPrompt();
        } 
        else {
            console.log("Thank you! Come back soon!");
            process.exit();
        }
    });
};

// Selecting the item they'd like to buy
function selectionPrompt() {
    inquirer.prompt([{

            type: "input",
            name: "inputId",
            message: "Please enter the ID number of the item you would like to purchase.",
            validate: validateInput,
            filter: Number
        },
        {
            type: "input",
            name: "inputNumber",
            message: "How many units of this item would you like to purchase?",
            validate: validateInput,
            filter: Number

        }
    ]).then(function(userPurchase) {
        let query = "SELECT * FROM products WHERE item_id=?";
        connection.query(query, userPurchase.inputId, function(err, res) {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {

                if (userPurchase.inputNumber > res[i].stock_quantity) {

                    console.log("***************************************************".red);
                    console.log("Sorry! Not enough in stock. Please try again later.".red);
                    console.log("***************************************************".red);
                    startPrompt();
                }
                else {
                    console.log("***********************************".green);
                    console.log("Awesome! We can fulfull your order.".green);
                    console.log("***********************************".green);
                    console.log("You've selected:".green);
                    console.log("----------------".green);
                    console.log("Item: " + res[i].product_name);
                    console.log("Department: " + res[i].department_name);
                    console.log("Price: " + res[i].price);
                    console.log("Quantity: " + userPurchase.inputNumber);
                    console.log("----------------".green);
                    console.log("Total: " + res[i].price * userPurchase.inputNumber);
                    console.log("***********************************".green);

                    let newStock = (res[i].stock_quantity - userPurchase.inputNumber);
                    let purchaseId = (userPurchase.inputId);
                    confirmPrompt(newStock, purchaseId);
                }
            }
        });
    });
};

// Confirming with the user they'd like to buy the selected item
function confirmPrompt(newStock, purchaseId) {
    inquirer.prompt([
        {
            type: "confirm",
            name: "confirmPurchase",
            message: "Are you sure you would like to purchase this item and quantity?",
            default: true
        }
        ]).then(function(userConfirm) {
        if (userConfirm.confirmPurchase === true) {
            let query = "UPDATE products SET ? WHERE ?";
            connection.query(query, [{stock_quantity: newStock}, {item_id: purchaseId}], function(err, res) {
                if (err) throw err;
            });
            
            console.log("*****************************".green);
            console.log("Transaction completed. Thank you.".green);
            console.log("*****************************".green);
            startPrompt();
        }
        else {
            console.log("*****************************".cyan);
            console.log("No worries. Maybe next time!".cyan);
            console.log("*****************************".cyan);
            startPrompt();
        }
    });
};