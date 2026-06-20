const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");

const logger = require("./middleware/logger");

const rateLimiter =
    require("./middleware/rateLimiter");

const errorHandler =
    require("./middleware/errorHandler");

const {
    getNextProductServer
} = require("./utils/loadBalancer");

const app = express();

app.use(cors());

app.use(express.json());

app.use(logger); 

app.use(morgan("dev"));

app.use(rateLimiter);


// --------------------
// USER ROUTES
// --------------------

app.get(
    "/users",
    async (req, res, next) => {
        try {

            const response =
                await axios.get(
                    "http://localhost:3001/users"
                );

            res.json(
                response.data
            );

        } catch (err) {
            next(err);
        }
    }
);

app.get(
    "/users/:id",
    async (req, res, next) => {
        try {

            const response =
                await axios.get(
                    `http://localhost:3001/users/${req.params.id}`
                );

            res.json(
                response.data
            );

        } catch (err) {
            next(err);
        }
    }
);


// --------------------
// PRODUCT ROUTES
// --------------------

app.get(
    "/products",
    async (req, res, next) => {
        try {

            const server =
                getHealthyProductServer()

            const response =
                await axios.get(
                    `${server}/products`
                );

            res.json(
                response.data
            );

        } catch (err) {
            next(err);
        }
    }
);

app.get(
    "/products/:id",
    async (req, res, next) => {
        try {

            const server =
                getHealthyProductServer()

            const response =
                await axios.get(
                    `${server}/products/${req.params.id}`
                );

            res.json(
                response.data
            );

        } catch (err) {
            next(err);
        }
    }
);


// --------------------
// ORDER ROUTES
// --------------------

app.get(
    "/orders",
    async (req, res, next) => {
        try {

            const response =
                await axios.get(
                    "http://localhost:3003/orders"
                );

            res.json(
                response.data
            );

        } catch (err) {
            next(err);
        }
    }
);

app.post(
    "/orders",
    async (req, res, next) => {
        try {

            const response =
                await axios.post(
                    "http://localhost:3003/orders",
                    req.body
                );

            res.json(
                response.data
            );

        } catch (err) {
            next(err);
        }
    }
);


// --------------------
// HEALTH
// --------------------

app.get(
    "/health",
    (req, res) => {
        res.json({
            status: "UP",
            service:
                "API Gateway"
        });
    }
);

app.use(errorHandler);

app.listen(
    3000,
    () => {
        console.log(
            "Gateway running on 3000"
        );
    }
);