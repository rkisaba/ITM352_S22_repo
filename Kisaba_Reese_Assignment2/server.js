//Server for Reese Kisaba Assignment 1

var express = require('express');
var app = express();

// Import and assign product information from products_data
var items_array = require("./products_data.json");

var filename = 'user_data.json';

const fs = require("fs");
if (fs.existsSync(filename)) {
    //Read filename (from my Lab 14 Ex1b.js)
    var user_info = fs.readFileSync(filename, 'utf-8');
    var user_data = JSON.parse(user_info);
}
else {
    console.log(filename + ' does not exist.');
    user_data = {};
}

// Importing parser and querystring
var myParser = require("body-parser");
const queryString = require('querystring');

// Taken from lab 13
app.use(myParser.urlencoded({ extended: true }));

// Validate whether or not inputs are valid
function isNonNegInt(q, returnErrors = false) {
    errors = [];
    if (q == "") { q = 0; }
    if (Number(q) != q) { errors.push('Not a Number!'); } //String is not a number, error Not a Number
    if (q < 0) { errors.push('Negative value!'); } //String is negative value, error Negative Value
    if (parseInt(q) != q) { errors.push('Not an Integer!'); } //String is not an integer, error Not an Integer
    return returnErrors ? errors : (errors.length == 0);
}

// Adopted from Lab 13 Exercise 3.
app.use(express.urlencoded({ extended: true }));
// Checks for the existence of the file, from Lab 14
if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf-8'); // if it exists, read the file user_data.json storedin filename
    var user_data = JSON.parse(data); // parse user data
}

app.post("/process_login", function (req, res) {
    var LogError = [];
    console.log(req.query);
    the_username = req.body.username.toLowerCase; //username in lowercase
    if (typeof user_data[the_username] != 'undefined') { //matching username
        if (user_data[the_username].password == req.body.password) {
            console.log(req.query);
            req.query.username = the_username;
            console.log(user_data[req.query.username].name);
            req.query.name = user_data[req.query.username].name
            res.redirect('/invoice.html?' + queryString.stringify(req.query));
            return; // all good, send to invoice
        } else { //password wrong, show invalid password
            LogError.push = ('Invalid Password');
            console.log(LogError);
            req.query.username = the_username;
            req.query.name = user_data[the_username].name;
            req.query.LogError = LogError.join(';');
        }
    } else { //push to the user invalid username if username is incorrect 
        LogError.push = ('Invalid Username');
        console.log(LogError);
        req.query.username = the_username;
        req.query.LogError = LogError.join(';');
    }
    res.redirect('./login.html?' + queryString.stringify(req.query));
});


// POST request from signup.html. Received help from Professor Port
// Registration validation (each validation adopted from https://www.w3resource.com/javascript/form/javascript-sample-registration-form-validation.php)
app.post("/process_register", function (req, res) {
    var reg_errors = {};  // assume no errors at start
    var reg_email = req.body.email.toLowerCase();
    var reg_username = req.body.username.toLowerCase();

    // EMAIL VALIDATION
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email)) { //check if the Email is correct
    }
    else {
        reg_errors['email'] = "Invalid email."; // error message for email that doesn't match format of name@website.domain
    }
    if (typeof user_data[reg_email] != 'undefined') { // Email must be unique
        reg_errors['email'] = 'This email is already taken!'; // error message if username is already in user_data.json file
    }

    // NAME VALIDATION
    if (/^[A-Za-z, ]+$/.test(req.body.fullname)) { // name must contain only letters
    } else {
        reg_errors['fullname'] = "Enter a name with alphabet characters only."; // error message if name contains numbers or invalid characters/symbols
    }

    if (req.body.fullname.length > 30 && req.body.fullname.length < 1) { // 30 characters or less
        reg_errors['fullname'] = "Name must be less than 30 characters."; // error message if name exceeds 30 characters or nothing in there
    }

    // USERNAME VALIDATION
    // alphanumeric check taken from https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
    if (/^[0-9a-z]+$/.test(req.body.username)) { // Letters and numbers only
    } else {
        reg_errors['username'] = "Enter a username with alphanumeric characters only.";  // error message if username contains invalid characeters/symbols
    }

    if (req.body.username.length > 10 || req.body.username.length < 4) { // 4-10 characters
        reg_errors['username'] = "Username must be 4-10 characters."; // error message if username is under 4 characters or over 10 characters
    }

    if (typeof user_data[reg_username] != 'undefined') { // Username must be unique
        reg_errors['username'] = 'This username is already taken!'; // error message if username is already in user_data.json file
    }

    // PASSWORD VALIDATION
    if (req.body.password.length < 8) {
        reg_errors['password'] = "Password must be atleast than 8 characters."; // error message if password doesn't exceed 8 characters
    }

    // CONFIRM PASSWORD VALIDATION
    if (req.body.password !== req.body.confirmpassword) {
        reg_errors['confirmpassword'] = "Passwords do not match." // error message if passwords don't match
    }


    // Save registration data to json file and send to invoice page if registration successful. 
    // Taken from Lab 14 Exercise 4.
    if (JSON.stringify(reg_errors) == '{}') {
        var email = req.body['email'].toLowerCase();
        user_data[email] = {};
        // information entered is added to user_data
        user_data[email]['name'] = req.body['fullname'];
        user_data[email]['password'] = req.body['password'];
        user_data[email]['email'] = req.body['email'];

        // stored data of purchase info goes into temp_qty_data
        fs.writeFileSync(filename, JSON.stringify(user_data), "utf-8");

        // username and email from temp_qty_data variable added into file as username and email
        temp_qty_data['email'] = email;
        temp_qty_data['email'] = user_data[email]["username"];
        let params = new URLSearchParams(temp_qty_data);
        res.redirect('./invoice.html?' + params.toString()); return; // go to invoice at the end of a successful registration process
    }

    // Otherwise back to registration with the registration errors.    
    else {
        req.body['reg_errors'] = JSON.stringify(reg_errors);
        let params = new URLSearchParams(req.body);
        res.redirect('register.html?' + params.toString()); // redirect to signup page after errors popup
    }
});

// Inputted quantities are less than stock
function validatestock_quantity(quantity_input, stock_quantity) {
    if (quantity_input > stock_quantity) {
        return false;
    }
}

// Routing 
app.use(myParser.urlencoded({ extended: true }));
app.post("/purchase", function (request, response) {
    let POST = request.body; // assigning req body to var

    // Validate inputted quantities
    if (typeof POST['purchase_submit'] != 'undefined') { // validating quantities, and valid quantities
        var hasValidQuantities = true;
        var hasQuantities = false;
        var stock_quantity = true;

        // Check to see that valid quantities are in stock
        for (i = 0; i < items_array.length; i++) {
            quantity = POST[`quantity${i}`];
            hasQuantities = quantity > 0;
            hasvalidQuantities = hasValidQuantities && isNonNegInt(quantity);
            stock_quantity = validatestock_quantity(quantity, items_array[i]['quantity_available']) && isNonNegInt(quantity);
        }

        // Make into queryString
        const stringified = queryString.stringify(POST);

        if (hasQuantities && hasValidQuantities && stock_quantity) {
            response.redirect("./invoice.html?" + stringified);
            return;
        } else {
            response.redirect("./products_display.html?" + stringified); // Send back to store
        }
    }
    console.log(request.body);
})









// monitor all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));