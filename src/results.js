import { supabase } from "./supabase.js";
import { compareResults } from "./libs.js";

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
                COMPETITION_ROUNDS(id,name,event_id,format_id,next_round,COMPETITIONS(id,name)),
                PERSONS(id,name,wcaid)
            `)
            .range(i * supabasePageSize, (i + 1) * supabasePageSize - 1);
        if (res.error) return res.error;

        results = results.concat(res.data);
    }

    // console.log(results);

    let groupedByRound = {};

    for (let r of results) {
        const roundId = r.COMPETITION_ROUNDS.id;
        if (!groupedByRound[roundId]) {
            groupedByRound[roundId] = [];
        }
        groupedByRound[roundId].push(r);
    }

    // assign positions within each round
    for (let roundId in groupedByRound) {
        let roundResults = groupedByRound[roundId];
        let round = results.find(r => r.COMPETITION_ROUNDS.id == roundId);

        // sort by average (or best) ascending, adjust field as needed
        roundResults.sort((a, b) => compareResults(a, b, round.COMPETITION_ROUNDS.format_id));

        // assign positions
        for (let i = 0; i < roundResults.length; i++) {
            if (i > 0 && compareResults(roundResults[i], roundResults[i - 1], round.COMPETITION_ROUNDS.format_id) == 0)
                roundResults[i].position = roundResults[i - 1].position;
            else roundResults[i].position = i + 1;
        }
    }

    return { results, groupedByRound };
}