const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

function verifyJWt(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('inside veryfiedJWT', authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // console.log(err);
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    });

}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiy1o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('spiceGranary').collection('items')

        //Auth 
        app.post('/token', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '2d'
            });
            res.send({ accessToken });
        })

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
        app.get('/myItems', verifyJWt, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            const query = { email: email };
            if (email === decodedEmail) {
                const cursor = itemsCollection.find(query);
                const resutl = await cursor.toArray();
                res.send(resutl);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }
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

        //POST - update item quantity
        app.put("/item", async (req, res) => {
            const item = req.body;
            console.log(item);
            const filter = { _id: ObjectId(item._id) };
            const updateDoc = {
                $set: {
                    quantity: item.quantity,
                },
            };
            const result = await itemsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        //DELETE - delete specificitem
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
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

