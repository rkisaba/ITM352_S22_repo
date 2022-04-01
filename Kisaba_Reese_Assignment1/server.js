var express = require('express');
var app = express();

// importing and assigning json with product information to variable
var items_array = require("./products_data.json");

// importing parser and querystring to package data for requests
var myParser = require("body-parser");
const queryString = require('querystring');

app.use(myParser.urlencoded({ extended: true })); // From lab 13

// function -- validates whether inputted values are acceptable, if not, sends errors
function isNonNegInt(q, returnErrors = false){
   errors = [];
   if (q == "") { q = 0; }
   if (Number(q) != q) { errors.push('Not a Number!'); }
   if (q < 0) { errors.push('Negative value!'); }
   if (parseInt(q) != q) { errors.push('Not an Integer!');}
   return returnErrors ? errors : (errors.length == 0);
}

// function -- validates whether inputted values are within quantity available range
function validatestock_quantity(quantity_input, stock_quantity){
   if (quantity_input > stock_quantity){
      return false;
   }
}

// Routing 
app.use(myParser.urlencoded({extended : true}));
app.post("/purchase", function(request, response) {
   let POST = request.body; // assigning req body to var
   
   // validating that all quantities recieved are valid 
   if (typeof POST['purchase_submit'] != 'undefined') { // validating quantities, and valid quantities
      var hasValidQuantities = true;
      var hasQuantities = false;
      var stock_quantity = true;

      // loops through every value and makes sure that values are valid -- has quantities, are valid quantities, and are in stock_quantity
      for (i = 0; i < items_array.length; i++){
      quantity = POST[`quantity${i}`];
      input_Quantities = quantity > 0;
      valid_Quantities = hasValidQuantities && isNonNegInt(quantity);
      stock_quantity = validatestock_quantity(quantity, items_array[i]['quantity_available']) && isNonNegInt(quantity);
      }

      // package the req.body into a queryString
      const stringified = queryString.stringify(POST); // convert req body to a querystring

      // if all requirements are met, redirect to invoice, if not , send back to store with errors
      if (hasQuantities && hasValidQuantities && stock_quantity) {
            response.redirect("./invoice.html?" + stringified); // send to invoice with req body
      } else {
       response.redirect("./products_display.html?" + stringified); // send back to store
      }
   }
   console.log(request.body);
})

app.post("/purchase_complete", function(request, response){
   response.redirect("./order_complete.html?");
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