DROP DATABASE IF EXISTS bamazon;

CREATE database bamazon;

USE bamazon;

CREATE TABLE products(
	item_id INT(10) AUTO_INCREMENT NOT NULL,
	product_name VARCHAR(100) NOT NULL,
	department_name VARCHAR(100) NOT NULL,
	price DECIMAL(10,2) NOT NULL,
	stock_quantity INT(20) NOT NULL,
	PRIMARY KEY (item_id)
);

Select * FROM products;

INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES ("Dye I4", "Paintball", 99.99, 20),
	   ("Steph Curry Tantrum Towel", "Infants", 29.99, 100),
	   ("Steelseries Kinzu", "Electronics", 39.99, 5),
	   ("Shure SM58", "Audio", 99.99, 104),
	   ("Starcraft 2", "Electronics", 19.99, 15),
	   ("Lego Boba Fett 75533", "Toys", 24.99, 19),
	   ("Headsweats Bigfoot Trucker hat", "Clothing", 26.99, 11),
	   ("Tippmann Model 98", "Paintball", 129.99, 10),
	   ("Tippmann TMC", "Paintball", 199.99, 19),
       ("Camelbak Crux 1.5l Reservoir", "Outdoors", 28.99, 17);
       
Select * FROM products;