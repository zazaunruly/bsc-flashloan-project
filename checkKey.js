require("dotenv").config();

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("Length:", process.env.PRIVATE_KEY?.length);