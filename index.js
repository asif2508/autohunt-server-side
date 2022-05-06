const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// using middle wares
app.use(cors());
app.use(express.json());

// connect to database

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://user1:aGdheVxCvvWm8Q0i@cluster0.ungi5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// main run function
async function run() {
    try {
      await client.connect();
      const inventoryCollection = client.db("autohunt").collection("inventories");
    
    //   sending all items
      app.get('/inventory', async (req, res)=>{
          const query = {};
          const cursor = inventoryCollection.find(query);
          const result = await cursor.toArray();
          res.send(result);
      })
      
    //   sending one item
      app.get('/inventory/:id', async (req, res)=>{
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const inventory = await inventoryCollection.findOne(query);
          res.send(inventory);
      })

    //   getting my items
      app.get('/myitems/:email', async(req, res)=>{
          const email = req.params.email;
          const query = {email: email}
          const cursor = inventoryCollection.find(query);
          const result =  await cursor.toArray();
          res.send(result);
      })

    // deleting items
    app.delete('/manageinventories/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : ObjectId(id)}
        const result = await inventoryCollection.deleteOne(query);
        res.send(result);
          
    })

    // adding new items
    app.post('/additems', async (req, res)=>{
        const inventory = req.body;
        const result = await inventoryCollection.insertOne(inventory);
        res.send(result);
    })
    } finally {
    //   await client.close();
    }
  }
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('server is running');
});

app.listen(port, ()=>{
    console.log("server is running on port",port);
})