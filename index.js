require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljf3d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // service db create
    const db = client.db("CriticizeIt");
    const servicesCollection = db.collection("services");

    // review db
    const reviewCollection = db.collection("reviews")


    // ----------------service apis------------------

    // post a service
    app.post("/add-service", async (req, res) => {
      const servicesData = req.body;
      const result = await servicesCollection.insertOne(servicesData);
      res.send(result);
    });

    // get all services data
    app.get("/all-services", async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;

      let query = {};

      if (search) {
        query.serviceTitle = {
          $regex: search,
          $options: "i",
        };
      }

      if (filter) {
        query.category = filter;
      }

      const result = await servicesCollection.find(query).toArray();

      res.send(result);
    });

    // get featured services data 
    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().limit(6).toArray();
      res.send(result);
    });
    

    // get a single service data by id 
    app.get("/serviceDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    // get all services by a specific user

    app.get('/myServices/:email', async (req,res)=>{
      const email = req.params.email
      const query ={ userEmail : email}
      const result = await servicesCollection.find(query).toArray()
      res.send(result)
    })






// ----------------review apis------------------



// post a review
app.post("/add-review", async (req, res) => {
  const reviewData = req.body;
  const result = await reviewCollection.insertOne(reviewData);
  res.send(result);
});

// get all reviews
app.get ("/reviews", async (req,res)=>{
  const result = await reviewCollection.find().toArray()
  res.send(result)
})




    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello ");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
