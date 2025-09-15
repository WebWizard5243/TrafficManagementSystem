import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pg from "pg"
dotenv.config();

const db = new pg.Client({
  connectionString: process.env.SUPABASE_CONNECTION_STRING, // from Supabase dashboard
  ssl: { rejectUnauthorized: false }  // required for Supabase
});
db.connect();



const saltRounds = 10;
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.get("/alerts", async(req,res) => {
    const apiKey = process.env.TOM_TOM_API;
    try {
        const response = await axios.get(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=88.2500,22.4500,88.4500,22.6500&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,id,events{description},magnitudeOfDelay,tmc{points{location}}}}}&language=en-GB&t=1111&timeValidityFilter=present`,
            {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Node.js Backend)',
      Accept: 'application/json'
    }
  }
        );
        const result = response.data.incidents;
        res.json(result);
    } catch (error) {
        console.log(error);
    }
})
app.post("/signup", async(req,res) => {
    try {
        const {name, email, password} = req.body;
        const result = await db.query("SELECT * FROM Users WHERE email = $1",[email]);
        if(result.rows.length > 0){
            return res.status(400).json({ message: "Email already exists" });
        } else {
            bcrypt.hash(password,saltRounds,async(err,hash) => {
                if(err){
                    console.log("error hashing the password", err);
                } else {
                    const result = await db.query(
                        "INSERT INTO Users (name , email, password) VALUES ($1,$2,$3) RETURNING *",
                        [name,email,hash]
                    );

                    // ✅ You forgot to actually return the inserted user here
                    const user = result.rows[0];

                    // ✅ Move token creation inside this block
                    const token = jwt.sign(
                        { id: user.id, email: user.email },
                        JWT_SECRET,
                        { expiresIn: "1h" }
                    );

                    return res.status(201).json({
                        message: "Signup successful",
                        token,
                        user,
                    });
                }
            })
        }
    } catch (error) {
        console.log("Error while signing up:", error);
        res.status(500).json({ message: "Signup failed" });
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" } // access token valid for 1 hour
        );

        res.json({ message: "Login successful", token, user });
    } catch (error) {
        console.log("Error while logging in:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


app.get("/detect", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:5000/vehicle_counts");
    const data = response.data; // no .json() needed
    res.json(data); // send to frontend
  } catch (err) {
    console.error("Error fetching counts from Python:", err);
    res.status(500).json({ error: "Failed to get counts" });
  }
});


app.get("/video_stream", (req, res) => {
  res.redirect("http://127.0.0.1:5000/video_stream");
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})