const express = require("express");
const app = express();
const cors = require("cors");
const { PORT } = require("./config/constants");
const adminRoutes = require("./routes/admin.routes");
const customerRoutes = require("./routes/customer.routes");
const artistRoutes = require("./routes/artist.routes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Database
require("./config/database");

//routes
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/artist", artistRoutes);

app.listen(PORT, () => {
  console.log(`Server is listing to port ${PORT}`);
});
