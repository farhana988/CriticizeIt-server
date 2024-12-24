require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionalSuccessStatus: 200,
}

// middleware
app.use(cors(corsOptions));
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
     // ----------------jwt functions------------------
    app.post('/jwt', async(req,res)=>{
      const email = req.body
      const token = jwt.sign(email, process.env.SECRET_KEY,{
        expiresIn:'3d'
      })
      console.log(token)
      res.cookie('token', token , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      }).send({success:true})
    })






    // ---------------- database creation ------------------

    // service db create
    const db = client.db("CriticizeIt");
    const servicesCollection = db.collection("services");

    // review db
    const reviewCollection = db.collection("reviews")

    // user db
    const userCollection = db.collection("users")


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
    app.get('/myServices/:email', async (req, res) => {
      const email = req.params.email;
      const searchQuery = req.query.search || ""; 
    
      const query = { userEmail: email };
    
      if (searchQuery) {
        query.$or = [
          { serviceTitle: { $regex: searchQuery, $options: 'i' } }, 
         
        ];
      }
    
        const result = await servicesCollection.find(query).toArray();
      
        res.send(result);
      
    });
    
    
    // delete a service
    app.delete('/service/:id', async (req,res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await servicesCollection.deleteOne(query)
      res.send(result)
    })

     // update a service
     app.put('/update-service/:id', async (req,res)=>{
      const id = req.params.id
      const serviceData = req.body
      const updated = {
        $set : serviceData
      }
      const query = {_id : new ObjectId(id)}
      const options = {upsert:true}
      const result = servicesCollection.updateOne(query, updated, options)
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

 // get all reviews by a specific user

 app.get('/myReviews/:email', async (req,res)=>{
  const email = req.params.email
  const query ={ userEmail : email}
  const result = await reviewCollection.find(query).toArray()
  res.send(result)
})

// delete a review
app.delete('/review/:id', async (req,res)=>{
  const id = req.params.id
  const query = {_id : new ObjectId(id)}
  const result = await reviewCollection.deleteOne(query)
  res.send(result)
})
   // update a review
   app.put('/update-review/:id', async (req,res)=>{
    const id = req.params.id
    const reviewData = req.body
    const updated = {
      $set : reviewData
    }
    const query = {_id : new ObjectId(id)}
    const options = {upsert:true}
    const result = reviewCollection.updateOne(query, updated, options)
    res.send(result)
  })




// ---------------user apis------------------

app.post("/users", async (req, res) => {
  const userData = req.body;
  const result = await userCollection.insertOne(userData);
  res.send(result);
});

// get users
app.get ("/users", async (req,res)=>{
  const result = await userCollection.find().toArray()
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
