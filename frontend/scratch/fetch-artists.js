const https = require('https');

https.get('https://sandbox-teste-deefy.olua.me/api/v1/artists?size=5', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      console.log(JSON.parse(data));
    } catch (e) {
      console.log('Error parsing JSON', data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
