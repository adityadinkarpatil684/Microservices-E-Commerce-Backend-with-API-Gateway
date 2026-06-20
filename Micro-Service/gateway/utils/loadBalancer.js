const axios = require("axios");

const productServers = [
    "http://localhost:3002",
    "http://localhost:3004"
];

let currentIndex = 0;

async function getHealthyProductServer() {

    const totalServers =
        productServers.length;

    for (
        let i = 0;
        i < totalServers;
        i++
    ) {

        const server =
            productServers[currentIndex];

        currentIndex =
            (currentIndex + 1) %
            totalServers;

        try {

            await axios.get(
                `${server}/health`,
                {
                    timeout: 1000
                }
            );

            return server;

        } catch {

            console.log(
                `${server} is DOWN`
            );

        }
    }

    throw new Error(
        "No healthy product service available"
    );
}

module.exports = {
    getHealthyProductServer
};