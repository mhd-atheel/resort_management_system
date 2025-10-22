const express = require('express');
const { connectMongoose } = require("./src/db.mongoose");
require("dotenv").config();
const userRoutes = require("./routers/userRoutes");
const customersRoutes = require("./routers/customersRoute");

const app = express();
app.use(express.json());


(async () => {
    await connectMongoose().then(() => console.log("Database connected succussfuly")
    ).catch((error) => console.log(error)
    );
    app.listen(process.env.PORT || 3000, () => console.log("API up"));
})();

app.get("/", (req, res) => {
    res.send("Hello Atheel");
});

app.use('/auth',userRoutes);
app.use('/customer',customersRoutes);







