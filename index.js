const express = require("express");
const userRoutes = require("./routes/userRoutes");
require("./config/dbConnection");
require("./server");

const app = express();

app.use(express.json());
app.use("/app", userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Database side server is listening at ${PORT}`);
});
