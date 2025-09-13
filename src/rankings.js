// import { supabase } from "./supabase.js";
import fs from "fs";

export async function fetchRankings(results) {
    const events = JSON.parse(fs.readFileSync("./api/events.json", "utf8"));
    // console.log(events);

    let groupedResults = {};

    for (let i = 0; i < events.length; i++) {
        const event_id = events[i].id;

        let filteredResults = [];
        for (let j = 0; j < results.length; j++) {
            if (results[j].COMPETITION_ROUNDS.event_id == event_id) {
                filteredResults.push({
                    person_id: results[j].PERSONS.id,
                    person_name: results[j].PERSONS.name,
                    competition_id: results[j].COMPETITION_ROUNDS.COMPETITIONS.id,
                    competition_name: results[j].COMPETITION_ROUNDS.COMPETITIONS.name,
                    best: results[j].best,
                    average: results[j].average,
                    solves: [results[j].value1, results[j].value2, results[j].value3, results[j].value4, results[j].value5]
                });
            }
        }

        groupedResults[event_id] = filteredResults;
    }

    // console.log(groupedResults);


    // result - avg
    for (let i = 0; i < events.length; i++) {
        const event_id = events[i].id;
        let nonDNFResults = [];

        for (let j = 0; j < groupedResults[event_id].length; j++) {
            if (groupedResults[event_id][j].average <= 0) continue;

            nonDNFResults.push({
                person_id: groupedResults[event_id][j].person_id,
                person_name: groupedResults[event_id][j].person_name,
                competition_id: groupedResults[event_id][j].competition_id,
                competition_name: groupedResults[event_id][j].competition_name,
                result: groupedResults[event_id][j].average,
                solves: groupedResults[event_id][j].solves
            });
        }

        nonDNFResults.sort((a, b) => a.result - b.result);

        for (let j = 0; j < nonDNFResults.length; j++) {
            if (j > 0 && nonDNFResults[j].result === nonDNFResults[j - 1].result)
                nonDNFResults[j].rank = nonDNFResults[j - 1].rank;
            else nonDNFResults[j].rank = j + 1;
        }

        let recordsToSave = nonDNFResults.filter(r => r.rank <= 100);

        try {
            fs.writeFileSync(`./api/rankings/result/average/${event_id}.json`, JSON.stringify(recordsToSave, null, 2));
            console.log(`Data written to /api/rankings/result/average/${event_id}.json`);
        } catch (err) {
            console.error("Failed to write file:", err);
        }
    }

    // result - best
    for (let i = 0; i < events.length; i++) {
        const event_id = events[i].id;
        let nonDNFResults = [];

        for (let j = 0; j < groupedResults[event_id].length; j++) {
            if (groupedResults[event_id][j].best <= 0) continue;

            for (let k = 0; k < groupedResults[event_id][j].solves.length; k++) {
                if (groupedResults[event_id][j].solves[k] <= 0) continue;

                nonDNFResults.push({
                    person_id: groupedResults[event_id][j].person_id,
                    person_name: groupedResults[event_id][j].person_name,
                    competition_id: groupedResults[event_id][j].competition_id,
                    competition_name: groupedResults[event_id][j].competition_name,
                    result: groupedResults[event_id][j].solves[k],
                    solves: []
                });
            }
        }

        nonDNFResults.sort((a, b) => a.result - b.result);

        for (let j = 0; j < nonDNFResults.length; j++) {
            if (j > 0 && nonDNFResults[j].result === nonDNFResults[j - 1].result)
                nonDNFResults[j].rank = nonDNFResults[j - 1].rank;
            else nonDNFResults[j].rank = j + 1;
        }

        let recordsToSave = nonDNFResults.filter(r => r.rank <= 100);

        try {
            fs.writeFileSync(`./api/rankings/result/best/${event_id}.json`, JSON.stringify(recordsToSave, null, 2));
            console.log(`Data written to /api/rankings/result/best/${event_id}.json`);
        } catch (err) {
            console.error("Failed to write file:", err);
        }
    }

    // person - avg
    for (let i = 0; i < events.length; i++) {
        const event_id = events[i].id;
        let nonDNFResults = [];

        for (let j = 0; j < groupedResults[event_id].length; j++) {
            if (groupedResults[event_id][j].average <= 0) continue;

            nonDNFResults.push({
                person_id: groupedResults[event_id][j].person_id,
                person_name: groupedResults[event_id][j].person_name,
                competition_id: groupedResults[event_id][j].competition_id,
                competition_name: groupedResults[event_id][j].competition_name,
                result: groupedResults[event_id][j].average,
                solves: groupedResults[event_id][j].solves
            });
        }

        nonDNFResults.sort((a, b) => a.result - b.result);

        let seen = new Set();
        let uniqueResults = [];
        for (let j = 0; j < nonDNFResults.length; j++) {
            if (!seen.has(nonDNFResults[j].person_id)) {
                seen.add(nonDNFResults[j].person_id);
                uniqueResults.push({ ...nonDNFResults[j] });
            }
        }

        for (let j = 0; j < uniqueResults.length; j++) {
            if (j > 0 && uniqueResults[j].result === uniqueResults[j - 1].result)
                uniqueResults[j].rank = uniqueResults[j - 1].rank;
            else uniqueResults[j].rank = j + 1;
        }

        let recordsToSave = uniqueResults.filter(r => r.rank <= 100);

        try {
            fs.writeFileSync(`./api/rankings/person/average/${event_id}.json`, JSON.stringify(recordsToSave, null, 2));
            console.log(`Data written to /api/rankings/person/average/${event_id}.json`);
        } catch (err) {
            console.error("Failed to write file:", err);
        }
    }

    // person - best
    for (let i = 0; i < events.length; i++) {
        const event_id = events[i].id;
        let nonDNFResults = [];

        for (let j = 0; j < groupedResults[event_id].length; j++) {
            if (groupedResults[event_id][j].best <= 0) continue;

            for (let k = 0; k < groupedResults[event_id][j].solves.length; k++) {
                if (groupedResults[event_id][j].solves[k] <= 0) continue;

                nonDNFResults.push({
                    person_id: groupedResults[event_id][j].person_id,
                    person_name: groupedResults[event_id][j].person_name,
                    competition_id: groupedResults[event_id][j].competition_id,
                    competition_name: groupedResults[event_id][j].competition_name,
                    result: groupedResults[event_id][j].solves[k],
                    solves: []
                });
            }
        }

        nonDNFResults.sort((a, b) => a.result - b.result);

        let seen = new Set();
        let uniqueResults = [];
        for (let j = 0; j < nonDNFResults.length; j++) {
            if (!seen.has(nonDNFResults[j].person_id)) {
                seen.add(nonDNFResults[j].person_id);
                uniqueResults.push({ ...nonDNFResults[j] });
            }
        }

        for (let j = 0; j < uniqueResults.length; j++) {
            if (j > 0 && uniqueResults[j].result === uniqueResults[j - 1].result)
                uniqueResults[j].rank = uniqueResults[j - 1].rank;
            else uniqueResults[j].rank = j + 1;
        }

        let recordsToSave = uniqueResults.filter(r => r.rank <= 100);

        try {
            fs.writeFileSync(`./api/rankings/person/best/${event_id}.json`, JSON.stringify(recordsToSave, null, 2));
            console.log(`Data written to /api/rankings/person/best/${event_id}.json`);
        } catch (err) {
            console.error("Failed to write file:", err);
        }
    }
}