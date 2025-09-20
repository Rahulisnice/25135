import express from "express";
import urlRoutes from "./routes/urlRoutes.js";

const app = express();
app.use(express.json());

// routes
app.use("/api/", urlRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server started successfully at: http://localhost:${PORT}`);
});
