import { supabase } from "./supabase.js";
import fs from "fs";

export async function fetchPersons(results, rankings, groupedByRound) {
    const events = JSON.parse(fs.readFileSync("./api/events.json", "utf8"));
    const { avgRankings, bestRankings } = rankings;
    const countRes = await supabase.from("RESULTS").select('*', { count: 'exact', head: true });
    if (countRes.error) return countRes.error;

    // console.log(countRes.count);

    const supabasePageSize = 1000;
    const numberOfSupabasePages = Math.ceil(countRes.count / supabasePageSize);

    let persons = [];

    for (let i = 0; i < numberOfSupabasePages; i++) {
        const res = await supabase.from("PERSONS")
            .select(`id,name,wcaid,gender`)
            .range(i * supabasePageSize, (i + 1) * supabasePageSize - 1);
        if (res.error) return res.error;

        persons = persons.concat(res.data);
    }

    // console.log(persons.length);

    for (let i = 0; i < persons.length; i++) {
        persons[i].results = {};
        persons[i].medals = {
            gold: 0,
            silver: 0,
            bronze: 0
        };
        persons[i].competition_ids = [];
        persons[i].completed_solves = 0;

        for (let roundId in groupedByRound) {
            let roundResults = groupedByRound[roundId];
            let result = roundResults.find(r => r.person_id == persons[i].id);

            if (result) {
                let eventId = result.COMPETITION_ROUNDS.event_id;
                let competitionId = result.COMPETITION_ROUNDS.COMPETITIONS.id;

                if (!persons[i].competition_ids.find(c => c == competitionId))
                    persons[i].competition_ids.push(competitionId);

                if (!persons[i].results[eventId]) {
                    persons[i].results[eventId] = {};
                }
                if (!persons[i].results[eventId][competitionId]) {
                    persons[i].results[eventId][competitionId] = {
                        competition_name: result.COMPETITION_ROUNDS.COMPETITIONS.name,
                        rounds: []
                    };
                }

                if (result.COMPETITION_ROUNDS.next_round == null) {
                    if (result.position == 1) persons[i].medals.gold++;
                    else if (result.position == 2) persons[i].medals.silver++;
                    else if (result.position == 3) persons[i].medals.bronze++;
                }

                persons[i].completed_solves += [result.value1, result.value2, result.value3, result.value4, result.value5].filter(r => r > 0).length;

                // push the result into the right group
                persons[i].results[eventId][competitionId].rounds.push({
                    single: result.best,
                    average: result.average,
                    solves: [result.value1, result.value2, result.value3, result.value4, result.value5],
                    position: result.position,
                    round_id: result.COMPETITION_ROUNDS.id,
                    round_name: result.COMPETITION_ROUNDS.next_round == null ? 'Chung kết' : `Vòng ${result.COMPETITION_ROUNDS.name.split(' ').at(-1)}`,
                    format_id: result.COMPETITION_ROUNDS.format_id
                });
            }
        }

        persons[i].rank = { singles: [], averages: [] };

        for (let j = 0; j < events.length; j++) {
            let event_id = events[j].id;

            let foundSingle = bestRankings[event_id].find(r => r.person_id == persons[i].id);
            if (foundSingle) {
                persons[i].rank.singles.push({
                    event_id: event_id,
                    result: foundSingle.result,
                    rank: foundSingle.rank
                });
            }

            let foundAvg = avgRankings[event_id].find(r => r.person_id == persons[i].id);
            if (foundAvg) {
                persons[i].rank.averages.push({
                    event_id: event_id,
                    result: foundAvg.result,
                    rank: foundAvg.rank
                });
            }
        }

        try {
            fs.writeFileSync(`./api/persons/${persons[i].id}.json`, JSON.stringify(persons[i], null, 2));
            // console.log(`Data written to /api/persons/${persons[i].id}.json`);
        } catch (err) {
            console.error("Failed to write file:", err);
        }
    }
}