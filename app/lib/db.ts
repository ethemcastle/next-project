import fs from "fs";
import path from "path";

export interface Item {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), "data.json");

function readDb(): Item[] {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeDb(items: Item[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));
}

export function getItems(): Item[] {
  return readDb();
}

export function getItem(id: string): Item | undefined {
  return readDb().find((item) => item.id === id);
}

export function createItem(title: string, description: string): Item {
  const items = readDb();
  const item: Item = {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  writeDb(items);
  return item;
}

export function updateItem(
  id: string,
  title: string,
  description: string
): Item | null {
  const items = readDb();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], title, description };
  writeDb(items);
  return items[index];
}

export function deleteItem(id: string): boolean {
  const items = readDb();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  writeDb(filtered);
  return true;
}

