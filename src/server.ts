import express from "express";

const app = express();

// アクセスがあるたびに時間をログに出す
app.get("/", (req, res) => {
  console.log(`[${new Date().toISOString()}] Health check ping received.`);
  res.send("Nekochi Bot Server is Online.");
});

export function startServer() {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Koyeb health check server listening on port ${port}`);
  });
}
