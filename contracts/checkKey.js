require('dotenv').config({ path: __dirname + '/.env' });

console.log('cwd:', process.cwd());
console.log('dotenv path:', __dirname + '/.env');
console.log('PRIVATE_KEY length:', process.env.PRIVATE_KEY?.length);
console.log('PRIVATE_KEY first 6 chars:', process.env.PRIVATE_KEY?.slice(0,6));