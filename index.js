const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// using middle wares
app.use(cors());
app.use(express.json());

// verifying token 
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded) =>{
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });

  
}

// connect to database
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ungi5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// main run function
async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("autohunt").collection("inventories");

    // login jwt
    app.post('/login', async (req, res) => {
      const user = req.body;
      var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.send({ token });

    })

    //   sending all items
    app.get('/inventory', async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //   sending one item
    app.get('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const inventory = await inventoryCollection.findOne(query);
      res.send(inventory);
    })
    // updating quantity
    app.put('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedData = {
        $set: data
      }
      const result = await inventoryCollection.updateOne(filter, updatedData, options);
      res.send(result);
    })

    //   getting my items
    app.get('/myitems/:email', verifyToken, async (req, res) => {
      const reqEmail = req.decoded.email;
      const email = req.params.email;
      if (reqEmail === email || reqEmail.email == "forJwtSocialLoginError") {
        const query = { email: email }
        const cursor = inventoryCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
      else{
        res.status(403).send({message : "Bad Request"})
      }
    })

    // deleting items
    app.delete('/manageinventories/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);

    })

    // adding new items
    app.post('/additems', async (req, res) => {
      const inventory = req.body;
      const result = await inventoryCollection.insertOne(inventory);
      res.send(result);
    })
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log("server is running on port", port);
})