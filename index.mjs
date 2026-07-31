import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.routes.js";
import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authMiddleware from "./src/middlewares/auth.middleware.js";
import APIError from "./src/utils/APIError.js";
import APIResponse from "./src/utils/APIResponse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = new express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser())

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// login - register 
app.use('/', authRoutes)

//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id/:name", authMiddleware, async (req, res) => {
  let conn; // 1. Declare outside try so catch & finally can access it
  try {
    const id = req.params.id;
    const name = req.params.name;
    // payment integration should be here
    // verify payment
    conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      await conn.query("ROLLBACK"); // 2. Rollback if seat already taken
      return APIResponse.badRequest(res, "Seat already booked!")
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");

    return APIResponse.ok(res, "Seat booked successfully!")
  } catch (ex) {
    if (conn) await conn.query("ROLLBACK")
    console.log(ex);
    res.status(500).json({ error: "Internal Server Error" })
  } finally {
    if (conn) conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)

  }
});

app.use((err, req, res, next) => {

  if (err instanceof APIError) {

    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong"
  });
});



app.listen(port, () => console.log("Server starting on port: " + port));
