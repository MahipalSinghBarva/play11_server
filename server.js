const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors")
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { connectDB } = require('./config/db.js');
const { errorMiddleware } = require('./middleware/error');
const userRoutes = require("./routes/userRoutes.js")
const walletRoutes = require("./routes/walletRoutes.js")
const liveScoreRoutes = require("./routes/liveScoreRoutes.js")
const contestRoutes = require("./routes/contestRoutes.js")
const adminRoutes = require("./routes/adminRoutes.js")



const app = express();

dotenv.config();
connectDB();


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ["http://127.0.0.1:5500", "http://localhost:5173"], credentials: true }))

app.use("/api/v1/user", userRoutes)
app.use("/api/v1/wallet", walletRoutes)
app.use("/api/v1/live-score", liveScoreRoutes)
app.use("/api/v1/contest", contestRoutes)
app.use("/api/v1/admin", adminRoutes)


app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.get('/', (req, res) => {
    res.send('API is running...');
});
