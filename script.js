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

        const todayString = today.toISOString().split('T')[0];
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        const matchesToDisplay = data.matches.filter(match => {
            const matchDate = match.utcDate.split('T')[0];
            return matchDate === todayString || matchDate === tomorrowString;
        });

        displayResults(matchesToDisplay);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
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
        homeTeamCell.textContent = match.homeTeam.name;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = `${match.score.fullTime.home} - ${match.score.fullTime.away}`;

        const visitorTeamCell = document.createElement('td');
        visitorTeamCell.textContent = match.awayTeam.name;

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

        const teamCell = document.createElement('td');
        teamCell.textContent = team.team.name;

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

window.addEventListener('load', () => {
    fetchResults();
    fetchStandings();

    // Tab switching functionality
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
        matchesTabButton.classList.remove('active');
        standingsTabButton.classList.add('active');
    }
}
