import { fetchEvents } from './src/events.js';
import { fetchResults } from './src/results.js';
import { fetchRankings } from './src/rankings.js';

async function fetchData() {
	try {
		// await fetchEvents();
        const results = await fetchResults();
		// await fetchPersons(results);
		await fetchRankings(results);
	} catch (err) {
		console.error('Failed to update JSON:', err);
		process.exit(1); // exit with error for GitHub Actions to mark it as failed
	}
}

fetchData();