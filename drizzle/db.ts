import { drizzle as drizzleConnect } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";
import postgres from "postgres";

const sql = postgres(process.env.PROXY_URL!, { ssl: "require" });
const drizzle = drizzleConnect(sql, { schema });

export default drizzle;
