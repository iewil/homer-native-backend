const express = require('express');

const app = express();
const port = process.env.PORT;


app.listen(port, () => console.log(`Native Homer backend app listening on port ${port}!`));
