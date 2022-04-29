const express = require('express');

const port = process.env.PORT || 5000;

const app = express();


//root API
app.get('/', (req, res) => {
    res.send('Hello from Spice Granary Server!!')
});

app.listen(port, () => {
    console.log('Spice Granary Server is running on port: ', port);
});

