const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.port || 8000
require("dotenv").config();

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req,res)=>{
    res.send('car doctor server is running')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.iw4kl2c.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const carDoctorDB = client.db('car-doctor-DB')
const servicesCollection = carDoctorDB.collection('services-collection')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/services', async(req, res)=>{
    const result = await servicesCollection.find({}).toArray()
    res.send(result)
    })

    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`car doctor server running in ${port}`)
})