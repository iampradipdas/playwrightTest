import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "..", "test-data", "data.json");

export function saveData(key: string, value: any) {
  let json: any = {};

  if (fs.existsSync(filePath)) {
    json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  json[key] = value;

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

export function getData(key: string) {
  if (!fs.existsSync(filePath)) return null;

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return json[key];
}
