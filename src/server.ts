import express from "express";

const app = express();

// アクセスがあるたびに時間をログに出す
app.get("/", (req, res) => {
  console.log(`[${new Date().toISOString()}] Health check ping received.`);
  res.send("Nekochi Bot Server is Online.");
});

export function startServer() {
  app.listen(3000, () => {
    console.log("Koyeb health check server listening on port 3000");
  });
}
