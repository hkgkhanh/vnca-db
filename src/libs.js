export function compareResults(a, b, format_id) {
    
    function compareWithDNF(x, y) {
        if (x < 0 && y >= 0) return 1;   // x is DNF then worse
        if (y < 0 && x >= 0) return -1;  // y is DNF then worse
        return x - y; // smaller is better
    }

    switch (format_id) {
        case "1": // bo1: only best
            return compareWithDNF(a.best, b.best);

        case "2": // bo2: best, then other solve
            {
                const cmpBest = compareWithDNF(a.best, b.best);
                if (cmpBest !== 0) return cmpBest;

                // fall back: compare worst (the larger one)
                const aOther = Math.max([a.value1, a.value2, a.value3, a.value4, a.value5]);
                const bOther = Math.max([b.value1, b.value2, b.value3, b.value4, b.value5]);
                return compareWithDNF(aOther, bOther);
            }

        case "3": // bo3: best, then avg
        case "5": // bo5: best, then avg
            {
                const cmpBest = compareWithDNF(a.best, b.best);
                if (cmpBest !== 0) return cmpBest;
                return compareWithDNF(a.average, b.average);
            }

        case "a": // ao5: avg, then best
        case "m": // mo3: avg, then best
            {
                const cmpAvg = compareWithDNF(a.average, b.average);
                if (cmpAvg !== 0) return cmpAvg;
                return compareWithDNF(a.best, b.best);
            }

        default:
            return 0; // tied
    }
}