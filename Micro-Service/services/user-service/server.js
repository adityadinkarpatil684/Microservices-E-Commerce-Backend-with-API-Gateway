const express = require("express");
const cors = require("cors");

const pool = require("./db");

const app = express();

app.use(cors());

app.use(express.json());


// ---------------------
// HEALTH CHECK
// ---------------------

app.get("/health", (req, res) => {

    res.json({
        status: "UP",
        service: "User Service"
    });

});


// ---------------------
// GET ALL USERS
// ---------------------

app.get("/users", async (req, res) => {

    try {

        const [users] =
            await pool.query(
                "SELECT * FROM users"
            );

        res.json(users);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch users"
        });

    }

});


// ---------------------
// GET USER BY ID
// ---------------------

app.get("/users/:id", async (req, res) => {

    try {

        const userId =
            req.params.id;

        const [user] =
            await pool.query(
                "SELECT * FROM users WHERE id = ?",
                [userId]
            );

        if (user.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });

        }

        res.json(user[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch user"
        });

    }

});


// ---------------------
// CREATE USER
// ---------------------

app.post("/users", async (req, res) => {

    try {

        const {
            name,
            email
        } = req.body;

        const [result] =
            await pool.query(
                `
                INSERT INTO users
                (name,email)
                VALUES (?,?)
                `,
                [name, email]
            );

        res.status(201).json({
            success: true,
            id: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to create user"
        });

    }

});


// ---------------------
// START SERVER
// ---------------------

app.listen(3001, () => {

    console.log(
        "User Service running on port 3001"
    );

});