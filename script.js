async function fetchResults() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    try {
        const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4/competitions/PL/matches', {
            headers: { 'X-Auth-Token': 'f9cf1300206b45738e2c423325e43f03' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const matches = data.matches;

        // Групуємо матчі за турами (matchday)
        const groupedMatches = groupMatchesByMatchday(matches);

        // Перевіряємо, чи всі матчі поточного туру завершені
        const todayString = today.toISOString().split('T')[0];
        const currentMatchday = getCurrentMatchday(groupedMatches, todayString);

        // Якщо всі матчі поточного туру завершено, показуємо матчі наступного туру
        let matchesToDisplay;
        const activeMatches = matches.filter(match => match.status === 'LIVE');

        if (activeMatches.length > 0) {
            matchesToDisplay = activeMatches; // Якщо є активні матчі, показуємо їх
        } else {
            if (currentMatchday && areAllMatchesFinished(groupedMatches[currentMatchday])) {
                const nextMatchdayMatches = getNextMatchdayMatches(groupedMatches, currentMatchday);
                matchesToDisplay = nextMatchdayMatches || [];
            } else {
                matchesToDisplay = matches.filter(match => {
                    const matchDate = match.utcDate.split('T')[0];
                    return matchDate === todayString || matchDate === tomorrow.toISOString().split('T')[0];
                });
            }
        }

        // Якщо немає матчів для відображення
        if (matchesToDisplay.length === 0) {
            const resultsBody = document.getElementById('results-body');
            resultsBody.innerHTML = '<tr><td colspan="4">There are no matches yet</td></tr>';
        } else {
            displayResults(matchesToDisplay);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Групуємо матчі по турам (matchday)
function groupMatchesByMatchday(matches) {
    return matches.reduce((grouped, match) => {
        const matchday = match.season.currentMatchday;
        if (!grouped[matchday]) {
            grouped[matchday] = [];
        }
        grouped[matchday].push(match);
        return grouped;
    }, {});
}

// Перевіряємо, чи всі матчі поточного туру завершені
function areAllMatchesFinished(matches) {
    return matches.every(match => match.status === 'FINISHED');
}

// Отримуємо поточний тур
function getCurrentMatchday(groupedMatches, todayString) {
    for (let matchday in groupedMatches) {
        const matchdayMatches = groupedMatches[matchday];
        // Перевірка, чи всі матчі в поточному турі завершені
        if (matchdayMatches.every(match => {
            const matchDate = match.utcDate.split('T')[0];
            return match.status === 'FINISHED' && matchDate <= todayString;
        })) {
            return matchday;  // Поточний тур завершено
        }
    }
    return null; // Якщо тур ще не завершено
}

// Отримуємо матчі наступного туру
function getNextMatchdayMatches(groupedMatches, currentMatchday) {
    const nextMatchday = parseInt(currentMatchday) + 1;
    return groupedMatches[nextMatchday] || null;
}

function displayResults(matches) {
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';

    matches.forEach(match => {
        const row = document.createElement('tr');
        let rowClass = '';

        if (match.status === 'FINISHED') {
            rowClass = match.score.fullTime.home > match.score.fullTime.away ? 'home-win' : match.score.fullTime.home < match.score.fullTime.away ? 'away-win' : 'draw';
        } else if (match.status === 'LIVE') {
            rowClass = 'live';
        }

        row.classList.add(rowClass);

        const homeTeamCell = document.createElement('td');
        homeTeamCell.classList.add('team-name');
        homeTeamCell.innerHTML = ` 
            <img src="${match.homeTeam.crest}" alt="${match.homeTeam.name}" class="team-logo">
            ${match.homeTeam.name}
        `;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = `${match.score.fullTime.home} - ${match.score.fullTime.away}`;

        const visitorTeamCell = document.createElement('td');
        visitorTeamCell.classList.add('team-name');
        visitorTeamCell.innerHTML = `
            <img src="${match.awayTeam.crest}" alt="${match.awayTeam.name}" class="team-logo">
            ${match.awayTeam.name}
        `;

        const statusCell = document.createElement('td');
        statusCell.textContent = `${match.status} (${getMatchMinute(match.utcDate)})`;

        row.appendChild(homeTeamCell);
        row.appendChild(scoreCell);
        row.appendChild(visitorTeamCell);
        row.appendChild(statusCell);

        resultsBody.appendChild(row);
    });
}

function getMatchMinute(utcDate) {
    const matchDate = new Date(utcDate);
    const now = new Date();
    const diffInMs = now - matchDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 0) return 'Match not started';
    if (diffInMinutes >= 90) return 'Full time';
    return `${diffInMinutes} хв`;
}

async function fetchStandings() {
    try {
        const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4/competitions/PL/standings', {
            headers: {
                'X-Auth-Token': 'f9cf1300206b45738e2c423325e43f03'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayStandings(data.standings[0].table);
    } catch (error) {
        console.error('Error fetching standings:', error);
    }
}

function displayStandings(standings) {
    const standingsBody = document.getElementById('standings-body');
    standingsBody.innerHTML = '';

    standings.forEach((team, index) => {
        const row = document.createElement('tr');

        const positionCell = document.createElement('td');
        positionCell.textContent = index + 1;

        // Стилізація для позицій
        if (index < 4) {
            positionCell.style.backgroundColor = '#0d32a4';
            positionCell.style.color = 'white';
        } else if (index === 4) {
            positionCell.style.backgroundColor = '#6e0606';
            positionCell.style.color = 'white';
        } else if (index === 5) {
            positionCell.style.backgroundColor = '#a48913';
            positionCell.style.color = 'white';
        } else if (index >= 17) {
            positionCell.style.backgroundColor = '#ff0000';
            positionCell.style.color = 'white';
        }

        const teamCell = document.createElement('td');
        teamCell.classList.add('team-name');
        teamCell.innerHTML = `
            <img src="${team.team.crest}" alt="${team.team.name}" class="team-logo">
            ${team.team.name}
        `;

        const playedGamesCell = document.createElement('td');
        playedGamesCell.textContent = team.playedGames;

        const wonCell = document.createElement('td');
        wonCell.textContent = team.won;

        const drawCell = document.createElement('td');
        drawCell.textContent = team.draw;

        const lostCell = document.createElement('td');
        lostCell.textContent = team.lost;

        const pointsCell = document.createElement('td');
        pointsCell.textContent = team.points;

        const goalDifferenceCell = document.createElement('td');
        goalDifferenceCell.textContent = team.goalDifference;

        row.appendChild(positionCell);
        row.appendChild(teamCell);
        row.appendChild(playedGamesCell);
        row.appendChild(wonCell);
        row.appendChild(drawCell);
        row.appendChild(lostCell);
        row.appendChild(pointsCell);
        row.appendChild(goalDifferenceCell);

        standingsBody.appendChild(row);
    });
}

document.getElementById('cors-demo-button').addEventListener('click', () => {
    window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
});

window.addEventListener('load', () => {
    fetchResults();
    fetchStandings();

    document.getElementById('matches-tab').addEventListener('click', () => {
        showTab('results');
    });

    document.getElementById('standings-tab').addEventListener('click', () => {
        showTab('standings');
    });
});

function showTab(tabId) {
    const resultsTab = document.getElementById('results');
    const standingsTab = document.getElementById('standings');
    const matchesTabButton = document.getElementById('matches-tab');
    const standingsTabButton = document.getElementById('standings-tab');

    if (tabId === 'results') {
        resultsTab.classList.add('active');
        standingsTab.classList.remove('active');
        matchesTabButton.classList.add('active');
        standingsTabButton.classList.remove('active');
    } else {
        standingsTab.classList.add('active');
        resultsTab.classList.remove('active');
        standingsTabButton.classList.add('active');
        matchesTabButton.classList.remove('active');
    }
}

