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
        service: "Product Service 2"
    });

});


// ---------------------
// GET ALL PRODUCTS
// ---------------------

app.get("/products", async (req, res) => {

    try {

        const [products] =
            await pool.query(
                "SELECT * FROM products"
            );

        res.json({
            instance: "PRODUCT-2",
            data: products
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch products"
        });

    }

});


// ---------------------
// GET PRODUCT BY ID
// ---------------------

app.get("/products/:id", async (req, res) => {

    try {

        const [product] =
            await pool.query(
                `
                SELECT *
                FROM products
                WHERE id = ?
                `,
                [req.params.id]
            );

        if (product.length === 0) {

            return res.status(404).json({
                message:
                    "Product not found"
            });

        }

        res.json({
            instance: "PRODUCT-2",
            data: product[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch product"
        });

    }

});


// ---------------------
// CREATE PRODUCT
// ---------------------

app.post("/products", async (req, res) => {

    try {

        const {
            name,
            price,
            stock
        } = req.body;

        const [result] =
            await pool.query(
                `
                INSERT INTO products
                (name,price,stock)
                VALUES (?,?,?)
                `,
                [
                    name,
                    price,
                    stock
                ]
            );

        res.status(201).json({
            success: true,
            id: result.insertId,
            instance: "PRODUCT-2"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to create product"
        });

    }

});


// ---------------------
// START SERVER
// ---------------------

app.listen(3004, () => {

    console.log(
        "Product Service 2 running on 3004"
    );

});