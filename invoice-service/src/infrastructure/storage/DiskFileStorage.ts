import { FileStorage } from "../../application/ports/FileStorage";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOADS_DIR = "./uploads";

export class DiskFileStorage implements FileStorage {
  async save(file: Buffer, filename: string): Promise<string> {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filepath = join(UPLOADS_DIR, `${Date.now()}-${filename}`);
    await writeFile(filepath, file);
    return filepath;
  }
}