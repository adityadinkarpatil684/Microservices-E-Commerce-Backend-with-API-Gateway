const express = require("express");
const cors = require("cors");
const axios = require("axios");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// ----------------------
// HEALTH CHECK
// ----------------------

app.get("/health", (req, res) => {

    res.json({
        status: "UP",
        service: "Order Service"
    });

});


// ----------------------
// GET ALL ORDERS
// ----------------------

app.get("/orders", async (req, res) => {

    try {

        const [orders] =
            await pool.query(
                "SELECT * FROM orders"
            );

        res.json(orders);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch orders"
        });

    }

});


// ----------------------
// CREATE ORDER
// ----------------------

app.post("/orders", async (req, res) => {

    try {

        const {
            userId,
            productId
        } = req.body;

        // ------------------
        // Validate User
        // ------------------

        let user;

        try {

            const userResponse =
                await axios.get(
                    `http://localhost:3001/users/${userId}`
                );

            user =
                userResponse.data;

        } catch {

            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });

        }

       // ------------------
// Validate Product
// ------------------

const PRODUCT_SERVERS = [
    "http://localhost:3002",
    "http://localhost:3004"
];

let product = null;

for (const server of PRODUCT_SERVERS) {

    try {

        const health =
            await axios.get(
                `${server}/health`,
                {
                    timeout: 1000
                }
            );

        if (
            health.data.status === "UP"
        ) {

            const productResponse =
                await axios.get(
                    `${server}/products/${productId}`
                );

            product =
                productResponse.data;

            break;
        }

    } catch {

        console.log(
            `${server} unavailable`
        );

    }
}

if (!product) {

    return res.status(404).json({

        success: false,

        message:
            "No Product Service Available"

    });

}

        // ------------------
        // Create Order
        // ------------------

        const [result] =
            await pool.query(
                `
                INSERT INTO orders
                (user_id, product_id)
                VALUES (?,?)
                `,
                [
                    userId,
                    productId
                ]
            );

        res.status(201).json({

            success: true,

            orderId:
                result.insertId,

            user,

            product

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to create order"

        });

    }

});


// ----------------------
// GET ORDER BY ID
// ----------------------

app.get(
    "/orders/:id",
    async (req, res) => {

        try {

            const [order] =
                await pool.query(
                    `
                    SELECT *
                    FROM orders
                    WHERE id = ?
                    `,
                    [req.params.id]
                );

            if (
                order.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Order not found"
                });

            }

            res.json(
                order[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch order"
            });

        }

    }
);


// ----------------------
// START SERVER
// ----------------------

app.listen(
    3003,
    () => {

        console.log(
            "Order Service running on port 3003"
        );

    }
);