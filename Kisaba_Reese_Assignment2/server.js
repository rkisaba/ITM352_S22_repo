//Server for Reese Kisaba Assignment 1

var express = require('express');
var app = express();

// Import and assign product information from products_data
var items_array = require("./products_data.json");

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
         input_Quantities = quantity > 0;
         valid_Quantities = hasValidQuantities && isNonNegInt(quantity);
         stock_quantity = validatestock_quantity(quantity, items_array[i]['quantity_available']) && isNonNegInt(quantity);
      }

      // Make into queryString
      const stringified = queryString.stringify(POST);

      if (hasQuantities && hasValidQuantities && stock_quantity) {
         response.redirect("./invoice.html?" + stringified); // Send to invoice page
      } else {
         response.redirect("./products_display.html?" + stringified); // Send back to store
      }
   }
   console.log(request.body);
})

if (typeof request.body.user != 'undefined') {
   response.redirect("./invoice.html?" + stringified);
} else {
   response.redirect("./login.html?" + stringified);
}


app.get("/login", function (request, response) {
   str = `
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <script src="./products_data.js" type="text/javascript"></script>
   <link rel="stylesheet" href="./css/login.css">
   <title>Document</title>
</head>
<script>
   let params = (new URL(document.location)).searchParams; 
   var quantities = [];
   for (i = 0; i < products_array.length; i++) {
      if (params.has("quantity${i}")) {
            a_qty = params.get("quantity${i}");
            quantities[i] = a_qty;
      }
   }

   window.onload = function() {
      for (i = 0; i < products_array.length; i++){
            if (quantities[i] != 0){
               document.getElementById("quantity${i}").value = quantities[i];
            }
      }
   }

</script>
<body>
   <form action="/login" method="POST">
      <div class="login_form">
            <h1>LOGIN</h1>
            <p>Log in with your username and password</p>
            <div class="email_input">
               <label for="email">USERNAME</label>
               <input type="text" id="user" name="user" placeholder="username">
            </div>
            <div class="pass_input">
               <label for="password">PASSWORD</label>
               <input type="password" id="password" name="password">
            </div>
            <div class="login_submit">
               <input type="submit" value="Log in">
            </div>
      </div>
      <script>
            for (i = 0; i < products_array.length; i++){
               document.write("
                  <input type="hidden" id="quantity${i}" name="quantity${i}" value="0">
               ")
            }
      </script>
   </form>
</body>
</html>

`;

   response.send(str);
})

app.post("/login", function (request, response) {
   // Process login form POST and redirect to logged in page if ok, back to login page if not
   the_username = request.body['user'].toLowerCase();
   the_password = request.body['password'];
   if (typeof filename[the_username] != 'undefined') {
      if (filename[the_username].password == the_password) {
         delete request.body.password;
         let POST = request.body;
         console.log(Object.keys(request.body).length);
         stringified = queryString.stringify(POST);
         if (Object.keys(request.body).length != 1) {
            console.log(filename[the_username]["user"]);
            response.redirect("./invoice.html?" + stringified);
         } else {
            response.redirect("./store.html?" + stringified);
         }
      } else {
         response.send(`Wrong password!`);
      }
      return;
   }
   response.send(`${the_username} does not exist`);
});

// app.get("/register", function(request, reponse){
//    response.redirect("./registration.html");
// })

// app.post("/register", function(request, response){
//    let POST = request.body;
//    the_username = POST.user;
//    the_password = POST.pass;
//    the_email = POST.email;
//    the_name = POST.name;
//    if (filename[the_username] != undefined){
//       stringified = queryString.stringify(POST);
//       response.redirect("./registration.html?" + stringified);
//    } else {
//       let newUser = `"${POST.user}":{"username": "${POST.name}", "password": "${POST.pass}", "email": "${POST.email}"}`
//       var fileRead = fs.readFileSync('user_data.json');
//       var newObject = JSON.parse(fileRead);
//       newObject.push(newUser);
//       newUser = JSON.stringify(newObject);
//       fs.writeFile('user_data.json', newUser);
//    }
// })


app.post("/purchase_complete", function (request, response) {
   let POST = request.body;
   console.log(POST);
   stringified = queryString.stringify(POST);
   response.redirect("./order_complete.html?" + stringified);
})

app.post("/index", function (request, response) {
   let POST = request.body;
   console.log(POST);
   stringified = queryString.stringify(POST);
   response.redirect("./index.html?" + stringified);
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