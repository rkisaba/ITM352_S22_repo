// Assignment 3 Updates: Borrowed and modified my Assignment 1 & 2 server, info_server_Ex4.js (Lab 13 & 14) screencasts
// Referred to and modified from Lab 13's Server Side Processing Screencast & Ex4
var data = require('./public/product_data.js'); // Links to product_data.js
var allProducts = data.allProducts; // Loads my product_data.js as var products
var qs = require('qs'); // Use variable 'qs' (query String) as the loaded module
var fs = require('fs'); // Loads/ starts up fs system actions
var express = require('express'); // Loads the Express module
var app = express(); // Starts & places Express module to variable 'app'
var myParser = require("body-parser"); // Grants access to POST data and loads the body-parser module
app.use(myParser.urlencoded({ extended: true })); // Retrieves the data from body
app.use(myParser.json()); // Decode json POSTS

var cookieParser = require('cookie-parser'); // Require cookie-parser
var session = require('express-session'); // Require express-session module
const nodemailer = require("nodemailer"); // Require nodemailer module
app.use(cookieParser()); // Middleware
// Borrowed and modified from Lab 14, Prof. Port's screencast 
const { request } = require('express');

app.use(session({ secret: "ITM352 rocks!" }));

var user_info_file = './user_data.json'; // Loads user data 

// Borrowed and modified from Lab 14, Prof. Port's screencasts 
    if (fs.existsSync(user_info_file)) { // Check if the user info file exists
        stats = fs.statSync(user_info_file)
        // Load in the user_data file to user_data object!
        console.log(user_info_file + ' has ' + stats.size + ' characters!');
        // Outputs in terminal how many characters or the size of my user data file
        data = fs.readFileSync(user_info_file, 'utf-8');
        var user_data = JSON.parse(data);
    } else {
        console.log(user_info_file + ' does not exist!');
    }

    app.all('*', function (req, res, next) { // Links to my request POST
        console.log(req.method + ' to ' + req.path); // Write the request method in the console and path
        next(); // Continue
    });

// ------------------------ Loading Cart Data ------------------------ //
    app.post("/loadcart", function (request, response) {
        if (typeof request.session.cart == "undefined") {// If cart data is not requested, create an object for it
            request.session.cart = {};
        }
        response.json(request.session.cart)//responds with the cart data as json
    });

// -------------------- Cart Quantity (in navbar) -------------------- // 
app.post('/cart_qty', function (req, res) {
    var total = 0;
    for (pkey in req.session.cart) {
        total += req.session.cart[pkey].reduce((a, b) => a + b);
    }
    res.json({"qty": total});
});

// ---------- Processing Add to Cart and Submit Cart ---------- // 
// Checking quantities is from my previous Assignment 1 server
    app.post("/add_toCart", function (request, response) {
        console.log(request.session);
        let POST = request.body; // Data should be in the body
        var qty = POST["prod_qty"];
        // Check if the quantities are NonNegInt (from previous Assignment 1)
        // Professor Port helped me create a product_key to post and save that session's quantities to the Shopping Cart
        if (typeof POST['submitCart'] != 'undefined') {
            product_key = POST["product_key"]; // POSTs the product_key
            products = allProducts[product_key];
            var hasvalidquantities = true; // Assumes that the variable is true (has valid quantities)
            let quantities = [];
            for (i = 0; i < products.length; i++) {
                qty = POST[`quantity${i}`];
                quantities[i] = qty;
                // hasquantities = hasquantities || qty > 0; // If value is > 0, then it is valid
                hasvalidquantities = hasvalidquantities && isNonNegInt(qty); // If quantity is both > 0 and valid
            }
        // NOTE: Following code will retain query string from products_display.html page 
        // Kimberly Matutina helped modify this code to update my cart
        if (hasvalidquantities) { // If valid, add the quantities to the cart/ session
            if (typeof request.session.cart == "undefined") {
                request.session.cart = {};
            }
                request.session.cart[product_key] = quantities; // Posts the user's session & quantities
                POST["message"] = "Successfully added to cart!"; // Posts messages if successful
            } else {
                POST["message"] = "Invalid quantities, cart not updated!"; // Posts messages if successful
            }
            const stringified = qs.stringify(POST);
            console.log(request.session);
            response.redirect(`./products.html?${stringified}`);
        }
    });

// -------------------- Updating/ Retrieving Cart Data -------------------- // 
// Kimberly Matutina helped me understand and work through this code to check quantity errors in the textbox when updating the cart
    app.post('/update_cart', function (req, res, next) {
        //req.session.cart = req.body;
        console.log(req.body, req.session.cart);
        // Replace cart in session with post
        let haserrors = false;
        for (let prodtype in req.body.quantities) { // For each prodtype's quantity textbox b/c it's in the page body
            for (let i in req.body.quantities[prodtype]) {
                qty = req.body.quantities[prodtype][i];
                haserrors = !isNonNegInt(qty) || haserrors;
            };
        };
        if (haserrors == true) {
            message = "Invalid quantities, cart cannot be updated!";
        } else {
            message = "Cart has been successfully updated!";
            req.session.cart = req.body.quantities;
        }
        const ref_URL = new URL(req.get('Referrer'));
        ref_URL.searchParams.set("message", message);
        res.redirect(ref_URL.toString());
    }); 

    app.post('/get_cart', function (req, res, next) { // Links to my request POST
        res.json(req.session.cart); // Write the request method in the console and path
    });

// ------------------------ Processing Login ------------------------ // 
// Borrowed and modified from Lab 14 exercise and some from Alyssa Mencel (Fall 2020)
    app.post("/process_login", function (req, res, next) {
        var LogError = [];
        console.log(req.query);
        var User_username = req.body.username.toLowerCase();
        if (typeof user_data[User_username] != 'undefined') { // Username and password should not be undefined
            if (user_data[User_username].password == req.body.password) {
                req.query.username = User_username;
                console.log(user_data[req.query.username].name);
                req.query.name = user_data[req.query.username].name;
                res.cookie('username', User_username);
                res.redirect('/cart.html?' + qs.stringify(req.query));
                // Redirect to invoice if username and password are correct
                return;
            }
            else { // If password is incorrect, display 'Invalid Password' message in console
                LogError.push = ('Invalid Password');
                console.log(LogError);
                req.query.username = User_username;
                req.query.name = user_data[User_username].name;
                req.query.LogError = LogError.join(';');
            }
            } else { // If username is incorrect, display 'Invalid Username' message in console
                LogError.push = ('Invalid Username');
                console.log(LogError);
                req.query.username = User_username;
                req.query.LogError = LogError.join(';');
            }
        res.redirect('./login.html?' + qs.stringify(req.query)); // If error is present, remain on the login page
    });

// ------------------------ Processing Registration ------------------------ // 
// Borrowed and modified from Lab 14 //
    app.post("/process_register", function (req, res) {
        qstr = req.body
        console.log(qstr);
        var errors = [];
        if (/^[A-Za-z]+$/.test(req.body.name)) { // Only allows letters to be used for full names
        }
        else {
            errors.push('Use Only Letters for Full Name')
        }
        // Validate whether or not it is a full name
        if (req.body.name == "") {
            errors.push('Invalid Full Name');
        }
        // Full name character length should be between 0 and 30 
        if ((req.body.fullname.length > 30 && req.body.fullname.length < 0)) {
            errors.push('Full Name Too Long')
        }
        // Checks the new username in lowercase across other usernames
        var userreg = req.body.username.toLowerCase();
        if (typeof user_data[userreg] != 'undefined') { // Gives error if username is taken and displays message 'Username taken'
            errors.push('Username taken')
        }
        // Requires usernames to be letters and numbers 
        if (/^[0-9a-zA-Z]+$/.test(req.body.username)) {
        }
        else {
            errors.push('Letters And Numbers Only for Username')
        }
// ------------------------ E-Mail Validation ------------------------ //
// Borrowed and modified from Lab 14 // 
    // Password must be at least 6 characters // 
        if (req.body.password.length < 6) {
            errors.push('Password Minimum 6 Characters')
        }
    // Checks to see that the password was entered correctly both times
        if (req.body.password !== req.body.repeat_password) {
            errors.push('Password Not a Match')
        }
    // Borrowed and modified from Lab 14 // 
    // If no errors are present, save username
    // This code also makes the user's fullname, username, and email sticky if there is an error so they don't to retype everything
        req.query.fullname = req.body.fullname;
        req.query.username = req.body.username;
        req.query.email = req.body.email;
        if (errors.length == 0) {
            console.log('no errors')
            var username = req.body.username;
            user_data[username] = {}; // Register it as user's information
            user_data[username].name = req.body.fullname;
            user_data[username].password = req.body.password;
            user_data[username].email = req.body.email;
            data = JSON.stringify(user_data);  // Set as user's information
            fs.writeFileSync(user_info_file, data, "utf-8");
            User_username = user_data[username]['name'];
            User_email = user_data[username]['email'];
            var user_info = {"username": username, "name": user_data[username].name, "email": user_data[username].email};
            res.cookie("username", User_username).send;
            res.redirect('./cart.html?' + qs.stringify(req.query));
        }
    // Borrowed and modified from Lab 14 // 
    // If errors are present, log the user into the console, redirect to registration page
        else {
            console.log(errors)
    // Redirect to registration page if error is present
            req.query.errors = errors.join(';');
            res.redirect('register.html?' + qs.stringify(req.query));
        }
    });

// ------------------------ Processing Log Out ------------------------ //
// Borrowed the res.clearCookie line from Kimberly Matutina 
    app.get("/logout", function (req, res) {
        // Nicholas Samson helped me personalize the user's username
        str = `<script>alert('${req.cookies["username"]} has successfully logged out!'); location.href="./index.html";</script>`; 
        res.clearCookie('username'); // Clears var user_info (username, email)
        res.send(str);
        req.session.destroy(); // Destroys session
    }); 

// ------------------------ Complete Purchase/ Email Invoice ------------------------ //
// Borrowed and modified from Assignment 3 Example 
    app.post('/complete_purchase', function (req, res) {
        console.log(req.body.invoicehtml);
            var invoicehtml = req.body.invoicehtml;
            // return;
            var username = req.cookies["username"];
            var the_email = user_data[username].email;
            var transporter = nodemailer.createTransport({
                host: "mail.hawaii.edu",
                port: 25,
                secure: false, // Use TLS
                tls: {
                    // Invalid Certifications
                    rejectUnauthorized: false
                }
            });
            var mailOptions = {
                from: 'noahkim2000@gmail.com',
                to: the_email,
                subject: 'Your Mac Shack Invoice',
                html: invoicehtml
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    status_str = 'There was an error and your invoice could not be emailed!';
                } else {
                    status_str = `Your invoice was mailed to ${user_data[username].email}`;
                }
                res.json({ "status" : status_str });
            });
            req.session.destroy();
        });

    // Reusing and repeating the isNonNegInt function from products_display.html
    function isNonNegInt(q, return_errors = false) { // Checks to see if inputted values are positive, an integer, or a whole value
        errors = []; // Assume there are no errors AT FIRST
        if (q == '' || q == null) q = 0; // Sets blank inputs to the quantity of 0 
        if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Check if the string is a number value
        else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if the string is non-negative
        else if (parseInt(q) != q) errors.push('<font color="red">Not a full value!</font>');
        // Check that it is an integer
        return return_errors ? errors : (errors.length == 0);
    }

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // Request and instructs to listen on port 8080