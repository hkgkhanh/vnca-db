import { supabase } from "./supabase.js";
import fs from "fs";

export async function fetchEvents() {
    const res = await supabase.from("EVENTS").select('*', { count: 'exact' });
    // const res = await supabase.from("EVENTS").select('*');
    if (res.error) return res.error;

    let data = res.data;

    data.sort((a, b) => {
        // sort by is_official (true first)
        if (a.is_official !== b.is_official) {
            return a.is_official ? -1 : 1;
        }

        // sort by id (lexical order)
        return a.id.localeCompare(b.id);
    });

    try {
        fs.writeFileSync("./api/events.json", JSON.stringify(data, null, 2));
        console.log("Data written to /api/events.json");
    } catch (err) {
        console.error("Failed to write file:", err);
    }
}