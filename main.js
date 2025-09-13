import { fetchEvents } from './src/events.js';
import { fetchResults } from './src/results.js';
import { fetchRankings } from './src/rankings.js';
import { fetchPersons } from './src/persons.js';

async function fetchData() {
	try {
		// await fetchEvents();
        const { results, groupedByRound } = await fetchResults();
		const rankings = await fetchRankings(results);
		await fetchPersons(results, rankings, groupedByRound);
	} catch (err) {
		console.error('Failed to update JSON:', err);
		process.exit(1); // exit with error for GitHub Actions to mark it as failed
	}
}

fetchData();