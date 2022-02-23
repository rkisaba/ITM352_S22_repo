require("./products_data.js");

var num_products = 5;

var counter = 1;

while(counter <= num_products){
    console.log(`${counter}. ${eval('name' + counter)}` );
    counter++;
    if(counter > num_products/2){
        console.log("Don't ask for anything else")
        process.exit();
        break;
    }
}
console.log("That's all we have!")


for(counter = 1; eval("typeof name"+counter) != 'undefined'; counter++){
    console.log(`${counter}. ${eval('name' + counter)}` );
    if(counter > num_products/2){
        console.log("Don't ask for anything else")
