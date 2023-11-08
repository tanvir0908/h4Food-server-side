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
    // await client.connect();

    // database collections
    const allFoodsCollection = client.db("h4food").collection("foodItems");
    const usersCollection = client.db("h4food").collection("users");
    const orderedFoodsCollection = client
      .db("h4food")
      .collection("orderedFoods");

    // all products api
    // get all food items data
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
    // add new food
    app.post("/api/v1/addFood", async (req, res) => {
      const newFood = req.body;
      const result = await allFoodsCollection.insertOne(newFood);
      res.send(result);
    });

    //update food details api
    app.put("/api/v1/updateFoodDetails", async (req, res) => {
      const id = req.body._id;
      const filter = { _id: new ObjectId(id) };

      const updatedFood = req.body;
      const food = {
        $set: {
          foodName: updatedFood.newFoodName,
          foodImage: updatedFood.newFoodImage,
          foodCategory: updatedFood.newFoodCategory,
          quantity: updatedFood.newQuantity,
          count: updatedFood.count,
          price: updatedFood.newPrice,
          userName: updatedFood.userName,
          userEmail: updatedFood.userEmail,
          origin: updatedFood.newOrigin,
          description: updatedFood.newDescription,
        },
      };
      const result = await allFoodsCollection.updateOne(filter, food);
      res.send(result);
    });

    //reduce quantity after successful order
    app.patch("/api/v1/reduceFoodsCount", async (req, res) => {
      const id = req.body._id;
      const orderQuantity = Number(req.body.orderQuantity);
      const newQuantity = req.body.quantity - orderQuantity;
      const newCount = req.body.count + orderQuantity;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          quantity: newQuantity,
          count: newCount,
        },
      };
      const result = await allFoodsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // order api
    // post order details into database
    app.post("/api/v1/orderFood", async (req, res) => {
      const newOrder = req.body;
      const result = await orderedFoodsCollection.insertOne(newOrder);
      res.send(result);
    });

    // users api
    // get added product data by users email
    app.get("/api/v1/getFoodByEmail", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await allFoodsCollection.find(query).toArray();
      res.send(result);
    });
    // get users ordered items by email
    app.get("/api/v1/getOrdersByEmail", async (req, res) => {
      const email = req.query.email;
      const query = { orderUserEmail: email };
      const result = await orderedFoodsCollection.find(query).toArray();
      res.send(result);
    });
    // store users information in database
    app.post("/api/v1/createUser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });
    // delete ordered food
    app.delete("/api/v1/deleteFood", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderedFoodsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });

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
  res.send("h4Food server is running...");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
