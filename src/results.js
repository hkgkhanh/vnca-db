import { supabase } from "./supabase.js";

export async function fetchResults() {
    const countRes = await supabase.from("RESULTS").select('*', { count: 'exact', head: true });
    // const res = await supabase.from("EVENTS").select('*');
    if (countRes.error) return countRes.error;

    const supabasePageSize = 1000;
    const numberOfSupabasePages = Math.ceil(countRes.count / supabasePageSize);

    let results = [];

    for (let i = 0; i < numberOfSupabasePages; i++) {
        const res = await supabase.from("RESULTS")
            .select(`
                *,
                COMPETITION_ROUNDS(id,event_id,next_round,COMPETITIONS(id,name)),
                PERSONS(id,name,wcaid)
            `)
            .range(i * supabasePageSize, (i + 1) * supabasePageSize - 1);
        if (res.error) return res.error;

        results = results.concat(res.data);
    }

    // console.log(results);

    return results;
}