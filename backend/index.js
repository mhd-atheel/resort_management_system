const express = require('express');
const { connectMongoose } = require("./src/db.mongoose");
require("dotenv").config();
var cors = require('cors')
const userRoutes = require("./routers/userRoutes");
const customersRoutes = require("./routers/customersRoute");
const RoomRoutes = require("./routers/roomsRoute");
const BookingRoutes = require("./routers/bookingRoute");
const DashboardRoutes = require("./routers/dashboardRoutes");

const app = express();
app.use(express.json());
app.use(cors('*'));


(async () => {
    await connectMongoose().then(() => console.log("Database connected succussfuly")
    ).catch((error) => console.log(error)
    );
    app.listen(process.env.PORT || 3000, () => console.log("API up"));
})();

app.get("/", (req, res) => {
    res.send("Resort management system");
});

app.use('/auth',userRoutes);
app.use('/customer',customersRoutes);
app.use('/room',RoomRoutes);
app.use('/booking',BookingRoutes);
app.use('/dashboard',DashboardRoutes);







