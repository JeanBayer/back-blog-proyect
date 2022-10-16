import express from "express";
import { db, connectDb } from "./db.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const article = await db.collection("articles").findOne({ name });
  if (!article) {
    res.status(404).json({ message: "Article not found" });
    return;
  }
  res.status(200).json(article);
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  await db.collection("articles").updateOne({ name }, { $inc: { upvotes: 1 } });
  const article = await db.collection("articles").findOne({ name });
  if (!article) {
    res.status(404).json({ message: "Article not found" });
    return;
  }

  res.status(200).json({ ...article });
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { text, postedBy } = req.body;

  await db.collection("articles").updateOne(
    { name },
    {
      $push: {
        comments: {
          text,
          postedBy,
        },
      },
    }
  );

  const article = await db.collection("articles").findOne({ name });

  if (!article) {
    res.status(404).json({ message: "Article not found" });
    return;
  }

  res.status(200).json([...article.comments]);
});

connectDb(() => {
  console.log(`db connected`);
  app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
});
