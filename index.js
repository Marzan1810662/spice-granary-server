const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        //GET -all items or 6items for home page
        app.get('/items', async (req, res) => {
            const query = {};
            const itemLimit = parseInt(req.query.itemLimit);
            console.log(itemLimit);
            const cursor = itemsCollection.find(query);
            let result;
            if (itemLimit) {
                result = await cursor.limit(itemLimit).toArray();
            }
            else {
                result = await cursor.toArray();
            }
            res.send(result);
        })

        //GET -get specific item with specific email
        app.get('/myItems', async (req, res) => {
            const email = req.query.email;
            console.log('email',email);
            const query = { email: email };

            const cursor = itemsCollection.find(query);
            const resutl = await cursor.toArray();
            res.send(resutl);

        })

        //GET - a specific item
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const item = await itemsCollection.findOne(query);

            res.send(item);

        })

        //POST -insert one item
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const result = await itemsCollection.insertOne(newItem);

            res.send(result);
        });

        //DELETE - delete specificitem
        app.delete('/item/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const result = await itemsCollection.deleteOne(query);

            res.send(result);

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

