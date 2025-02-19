const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://spots4u.netlify.app/"], // Replace with your React app URL
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ak4euur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const allSpots = client.db("SpotsDB").collection("Spots");
    const allCountries = client.db("SpotsDB").collection("Countries");

    app.get("/spots", async (req, res) => {
      const cursor = allSpots.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const spot = await allSpots.findOne(query);
      res.send(spot);
    });

    app.get("/spots/search/:country", async (req, res) => {
      const country = req.params.country;
      const query = { country: country };
      const cursor = await allSpots.find(query).toArray();
      res.send(cursor);
      console.log(cursor);
    });

    app.post("/spots", async (req, res) => {
      const spot = req.body;
      const result = await allSpots.insertOne(spot);
      res.send(result);
    });

    app.get("/countries", async (req, res) => {
      const cursor = allCountries.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/countries", async (req, res) => {
      const country = req.body;
      const result = await allCountries.insertOne(country);
      res.send(result);
    });

    app.put("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const updatedSpot = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const setUpdatedSpot = {
        $set: {
          spotName: updatedSpot.spotName,
          country: updatedSpot.country,
          location: updatedSpot.location,
          description: updatedSpot.description,
          cost: updatedSpot.cost,
          seasonality: updatedSpot.seasonality,
          time: updatedSpot.time,
          visitor: updatedSpot.visitor,
          image: updatedSpot.image,
          userEmail: updatedSpot.userEmail,
          userName: updatedSpot.userName,
        },
      };
      const result = await allSpots.updateOne(filter, setUpdatedSpot, options);
      res.send(result);
    });

    app.delete("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allSpots.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Spots4U server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
