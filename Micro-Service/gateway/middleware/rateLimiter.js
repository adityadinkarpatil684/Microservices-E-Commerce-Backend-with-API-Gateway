const requestStore = {};

const WINDOW_SIZE = 60 * 1000;
const MAX_REQUESTS = 10;

function rateLimiter(req, res, next) {

    const ip = req.ip;

    const currentTime = Date.now();

    if (!requestStore[ip]) {
        requestStore[ip] = [];
    }

    requestStore[ip] =
        requestStore[ip].filter(
            timestamp =>
                currentTime - timestamp <
                WINDOW_SIZE
        );

    if (
        requestStore[ip].length >=
        MAX_REQUESTS
    ) {
        return res.status(429).json({
            success: false,
            message:
                "Too Many Requests"
        });
    }

    requestStore[ip].push(
        currentTime
    );

    next();
}

module.exports = rateLimiter;