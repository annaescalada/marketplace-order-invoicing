export interface FileStorage {
  save(file: Buffer, filename: string): Promise<string>;
}