const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiy1o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('spiceGranary').collection('items')

        app.get('/items', async (req, res) => {
            res.send('connected to mongo db')
        })
    }
    finally {

    }
}

run().catch(console.dir);




//root API
app.get('/', (req, res) => {
    res.send('Hello from Spice Granary Server!!')
});

app.listen(port, () => {
    console.log('Spice Granary Server is running on port: ', port);
});

