const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken')
const port = process.env.port || 8000
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('car doctor server is running')
})


// JWT validation -***-***-***-
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(403).send({ error: true, message: 'unauthorized user' })
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded)=>{
    if (err) {
      return res.status(403).send({ error: true, message: 'unauthorized user' })
    }
    // req.decoded = decoded
    next()
  })
}

// for node version 4.1 or later
// const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.iw4kl2c.mongodb.net/?retryWrites=true&w=majority`;
// for node version 2.2.12 or later
var uri = `mongodb://${process.env.USER}:${process.env.PASS}@ac-sdycgbe-shard-00-00.iw4kl2c.mongodb.net:27017,ac-sdycgbe-shard-00-01.iw4kl2c.mongodb.net:27017,ac-sdycgbe-shard-00-02.iw4kl2c.mongodb.net:27017/?ssl=true&replicaSet=atlas-12xt4i-shard-0&authSource=admin&retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const carDoctorDB = client.db('car-doctor-DB')
    const servicesCollection = carDoctorDB.collection('services-collection')
    const bookingCollection = carDoctorDB.collection('booking-collection')
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // for json web token
    app.post('/jwt', (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
      // console.log(token);
      res.send({ token })
    })

    // create booking
    app.post('/booking', async (req, res) => {
      const order = req.body
      const result = await bookingCollection.insertOne(order)
      res.send(result)
    })

    //some booking data read via logged in user's email
    app.get('/booking', verifyToken, async (req, res) => {
      // console.log('came back after verifying JWT token');
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    })

    // update booking data (add confirm status)
    app.patch('/booking/:id', async (req, res) => {
      const { status } = req.body
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          status
        },
      };
      const result = await bookingCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    // get all services data
    app.get('/services', async (req, res) => {
      const result = await servicesCollection.find({}).toArray()
      res.send(result)
    })
    // get single services data
    app.get('services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })

    // get specific service data via id
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })

    // delete booking via id
    app.delete(`/booking/:id`, async (req, res) => {
      const id = req.params.id
      console.log(req.authorization);
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`car doctor server running in ${port}`)
})