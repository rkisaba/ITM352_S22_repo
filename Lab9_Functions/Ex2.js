function isPositiveInt(q, returnErrors=false) { //This function is used to determine whether or not a part of a string is a positive integer or not
    errors = []; // assume no errors at first
    if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return returnErrors ? errors : (errors.length == 0);
}

attributes  =  "Reese;19;19.5;-18.5" ;

var parts_array = attributes.split(';')

for(let part of parts_array) {
    let errs = isPositiveInt(part, true);
    console.log(`Part ${part} isNonNegInt ${errs.join(' ')}`);
}

function checkIt(item, index) {
    console.log(`part ${index} is ${(isPositiveInt(item)?'a':'not a')} quantity`);
}

function download(url, callback) {
    setTimeout(() => {
        // script to download the picture here
        console.log(`Downloading ${url} ...`);
        picture_data = "image data:XOXOXO";
    }, 3* 1000);
    callback(picture_data);
}

function process(picture) {
    console.log(`Processing ${picture}`);
}

let url = 'https://www.example.comt/big_pic.jpg';
download(url, process);
