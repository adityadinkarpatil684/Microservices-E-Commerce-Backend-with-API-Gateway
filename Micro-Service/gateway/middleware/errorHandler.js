// function errorHandler(
//     err,
//     req,
//     res,
//     next
// ) {
//     console.error(err);

//     res.status(500).json({
//         success: false,
//         message:
//             "Internal Server Error"
//     });
// }

// module.exports = errorHandler;

function errorHandler(
    err,
    req,
    res,
    next
) {

    console.error(
        "ERROR:",
        err.message
    );

    if (
        err.message.includes(
            "No healthy product"
        )
    ) {

        return res
            .status(503)
            .json({

                success: false,

                message:
                    "Product Service Unavailable"

            });

    }

    res.status(500).json({

        success: false,

        message:
            err.message ||
            "Internal Server Error"

    });
}

module.exports = errorHandler;