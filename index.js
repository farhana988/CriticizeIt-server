const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
app.use(cors())
app.use(express.json())
// app.use(cookieParser())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljf3d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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

    // db create
    const db = client.db('CriticizeIt')
    const servicesCollection = db.collection('services')



    // post a service
    app.post('/add-service', async (req, res) => {
      const servicesData = req.body
      const result = await servicesCollection.insertOne(servicesData)
      console.log(result)
      res.send(result)
    })


      // get all services data from db
      app.get('/all-services', async (req, res) => {
        const result = await servicesCollection.find().toArray()
        res.send(result)
      })


   





















  
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello ')
  })
  
  app.listen(port, () => console.log(`Server running on port ${port}`))