const express = require("express");
require("dotenv").config();
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8snrbzq.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // database collections
    const allFoodsCollection = client.db("h4food").collection("foodItems");

    // all products api
    // get all products data
    app.get("/api/v1/foodItems", async (req, res) => {
      const result = await allFoodsCollection.find().toArray();
      res.send(result);
    });
    // get data by pagination
    app.get("/api/v1/pageItems", async (req, res) => {
      // console.log(req.query.page);
      const page = Number(req.query.page);
      const result = await allFoodsCollection
        .find()
        .skip(page * 9)
        .limit(9)
        .toArray();
      res.send(result);
    });
    // get top selling 6 food items api
    app.get("/api/v1/topSelling", async (req, res) => {
      const query = {};
      const options = {
        sort: { count: -1 },
      };
      const result = await allFoodsCollection
        .find(query, options)
        .limit(6)
        .toArray();
      res.send(result);
    });
    // get single food details using id
    app.get("/api/v1/foodDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allFoodsCollection.findOne(query);
      res.send(result);
    });
    // get total food items count
    app.get("/api/v1/foodsCount", async (req, res) => {
      const count = await allFoodsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    await client.db("admin").command({ ping: 1 });

    // Send a ping to confirm a successful connection
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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
