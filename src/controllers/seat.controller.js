import { pool } from "../config/db.js";
import APIError from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";

async function bookSeat(req, res) {
    let conn; // 1. Declare outside try so catch & finally can access it
    try {
        let name = req.user.name;

        const movie = req.params.movie;
        const id = Number(req.params.id);

        const VALID_MOVIES = ['odyssey', 'dhurandhar', 'avengers', 'sholay'];

        if (!VALID_MOVIES.includes(movie.toLowerCase())) {
            throw APIError.notFound('Invalid movie name!');
        }

        conn = await pool.connect(); // pick a connection from the pool
        //begin transaction
        // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
        await conn.query("BEGIN");

        const sql = `SELECT * FROM ${movie} where id = $1 and isbooked = 0 FOR UPDATE`;
        const result = await conn.query(sql, [id]);

        if (result.rowCount === 0) {
            await conn.query("ROLLBACK"); // 2. Rollback if seat already taken
            throw APIError.badRequest("Seat already booked!")
        }

        const sqlU = `update ${movie} set isbooked = 1, name = $2 where id = $1`;
        await conn.query(sqlU, [id, name]);

        //end transaction by committing
        await conn.query("COMMIT");

        return APIResponse.ok(res, "Seat booked successfully!")
    } catch (ex) {
        if (conn) await conn.query("ROLLBACK");

        console.error(ex);

        if (ex instanceof APIError) throw ex;
        throw APIError.internalError("Unable to book seat");
    } finally {
        if (conn) conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)

    }
}

async function getSeatsByMovie(req, res) {
    let movieName = req.query.movie;

    if (!movieName) {
        throw APIError.badRequest('Please provide a movie name to get seats for the movie!')
    }

    const VALID_MOVIES = ['odyssey', 'dhurandhar', 'avengers', 'sholay'];

    if (!VALID_MOVIES.includes(movieName.toLowerCase())) {
        throw APIError.notFound('Invalid movie name!');
    }

    const result = await pool.query(`select * from ${movieName.toLowerCase()} ORDER BY id ASC`)

    if (result.rowCount <= 0) {
        throw APIError.badRequest("No seats found!")
    }

    return APIResponse.ok(res, "Seats found successfully!", result.rows)
}

export { bookSeat, getSeatsByMovie };
