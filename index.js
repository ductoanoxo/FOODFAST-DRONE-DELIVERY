const express = require("express");
const enforce = require('express-sslify');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("./database/db");
const route = require("./routes/flyfoods-routes");
const passport = require("passport");
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(passport.initialize());
require("./config/passport")(passport);

// API routes
app.use("/api/flyfoods", route);

// Default route
app.get("/", (req, res) => {
    res.send("🚀 API is running");
});

// Production/staging
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(enforce.HTTPS({ trustProtoHeader: true }))
    app.use(express.static('client/build'));
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, "./client/build/index.html"));
    });
}

// Catch 404
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        errors: {
            message: err.message,
            error: process.env.NODE_ENV === "development" ? err : {}
        }
    });
});

app.listen(port, () => {
    console.log("✅ Server is running on port " + port)
});