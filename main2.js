 // Define JSON File
 var fs = require("fs");
 console.log("\n *STARTING* \n");
// Get content from file
 var contents = fs.readFileSync("file.json");
// Define to JSON type
 var jsonContent = JSON.parse(contents);
 console.log("ID = "+jsonContent.id);
 console.log("\n *EXIT* \n");