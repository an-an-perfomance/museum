import { pool } from "./db";

export type Photo = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  createdAt: string;
};

function rowToPhoto(row: {
  id: number;
  title: string;
  description: string | null;
  url: string;
  created_at: Date;
}): Photo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    createdAt: row.created_at.toISOString(),
  };
}

export async function findAll(): Promise<Photo[]> {
  const result = await pool.query(
    "SELECT id, title, description, url, created_at FROM photos ORDER BY id"
  );
  return result.rows.map(rowToPhoto);
}

export async function findById(id: number): Promise<Photo | null> {
  const result = await pool.query(
    "SELECT id, title, description, url, created_at FROM photos WHERE id = $1",
    [id]
  );
  if (result.rows.length === 0) return null;
  return rowToPhoto(result.rows[0]);
}

export async function create(data: {
  title: string;
  description?: string;
  url: string;
}): Promise<Photo> {
  const result = await pool.query(
    "INSERT INTO photos (title, description, url) VALUES ($1, $2, $3) RETURNING id, title, description, url, created_at",
    [data.title, data.description ?? null, data.url]
  );
  return rowToPhoto(result.rows[0]);
}

export async function update(
  id: number,
  data: { title?: string; description?: string }
): Promise<Photo | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (data.title !== undefined) {
    updates.push(`title = $${i++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${i++}`);
    values.push(data.description);
  }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const result = await pool.query(
    `UPDATE photos SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, title, description, url, created_at`,
    values
  );
  if (result.rows.length === 0) return null;
  return rowToPhoto(result.rows[0]);
}

export async function deleteByIds(ids: number[]): Promise<{
  deletedIds: number[];
  notFoundIds: number[];
}> {
  const existing = await pool.query(
    "SELECT id FROM photos WHERE id = ANY($1::int[])",
    [ids]
  );
  const existingIds = new Set(existing.rows.map((r: { id: number }) => r.id));
  const deletedIds = ids.filter((id) => existingIds.has(id));
  const notFoundIds = ids.filter((id) => !existingIds.has(id));
  if (deletedIds.length > 0) {
    await pool.query("DELETE FROM photos WHERE id = ANY($1::int[])", [
      deletedIds,
    ]);
  }
  return { deletedIds, notFoundIds };
}
