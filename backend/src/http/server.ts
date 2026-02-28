import express from "express";
import cors from "cors";
import { env } from "../config/env";
import {
  initDb,
  findAll,
  findById,
  create,
  update,
  deleteByIds,
} from "../infra";

const app = express();

app.use(cors());
app.use(express.json());

function photoToJson(photo: { id: number; title: string; description: string | null; url: string; createdAt: string }) {
  return {
    id: photo.id,
    title: photo.title,
    ...(photo.description !== null && { description: photo.description }),
    url: photo.url,
    createdAt: photo.createdAt,
  };
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// 1. Получение всех фото
app.get("/photos", async (_req, res) => {
  try {
    const photos = await findAll();
    res.status(200).json(photos.map(photoToJson));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 2. Получение одного фото по id
app.get("/photos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid id parameter" });
  }

  try {
    const photo = await findById(id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    return res.status(200).json(photoToJson(photo));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 3. Удаление фото по передаче массива ids
app.delete("/photos", async (req, res) => {
  const { ids } = req.body as { ids?: unknown };

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "Field 'ids' must be an array of numbers" });
  }

  if (ids.length === 0) {
    return res.status(400).json({ message: "Field 'ids' must not be empty" });
  }

  const numericIds = ids.map((value) => Number(value)).filter((value) => !Number.isNaN(value));

  if (numericIds.length !== ids.length) {
    return res.status(400).json({ message: "All ids must be valid numbers" });
  }

  try {
    const result = await deleteByIds(numericIds);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 4. Изменение названия или описания фотографии
app.patch("/photos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid id parameter" });
  }

  const { title, description } = req.body as {
    title?: unknown;
    description?: unknown;
  };

  if (title === undefined && description === undefined) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0 || title.length > 255) {
      return res
        .status(400)
        .json({ message: "Field 'title' must be a non-empty string up to 255 characters" });
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 2000) {
      return res
        .status(400)
        .json({ message: "Field 'description' must be a string up to 2000 characters" });
    }
  }

  try {
    const photo = await update(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    });
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    return res.status(200).json(photoToJson(photo));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 5. Добавление фото
app.post("/photos", async (req, res) => {
  const { title, description, url } = req.body as {
    title?: unknown;
    description?: unknown;
    url?: unknown;
  };

  if (typeof title !== "string" || title.trim().length === 0 || title.length > 255) {
    return res
      .status(400)
      .json({ message: "Field 'title' must be a non-empty string up to 255 characters" });
  }

  if (description !== undefined && (typeof description !== "string" || description.length > 2000)) {
    return res
      .status(400)
      .json({ message: "Field 'description' must be a string up to 2000 characters" });
  }

  if (typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ message: "Field 'url' must be a non-empty string" });
  }

  try {
    const photo = await create({
      title,
      description: description as string | undefined,
      url,
    });
    return res.status(201).json(photoToJson(photo));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export async function startServer(): Promise<void> {
  await initDb();
  app.listen(env.port, () => {
    console.log(`API server listening on port ${env.port}`);
  });
}
