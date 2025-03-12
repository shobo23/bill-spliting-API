const Express = require("express");
const route = require("./routes/routes");
const connectDb = require("./config/billConfiq");
require("dotenv/config");
const app = Express();
app.use(Express.json());

const { PORT } = process.env;

connectDb();

app.use("/api", route);

app.all("/", (req, res) => {
  return res.status(200).json({ message: "api up and running" });
});

app.all("*", (req, res) => {
  return res.status(404).json({ message: "route does not exist" });
});

app.listen(PORT, () => {
  console.log(new Date().toLocaleDateString(), PORT);
});
