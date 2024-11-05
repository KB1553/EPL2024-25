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

        const homeTeamCell = document.createElement('td');
        homeTeamCell.textContent = match.homeTeam.name;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = `${match.score.fullTime.home} - ${match.score.fullTime.away}`;

        const visitorTeamCell = document.createElement('td');
        visitorTeamCell.textContent = match.awayTeam.name;

        const statusCell = document.createElement('td');
        statusCell.textContent = match.status;

        row.appendChild(homeTeamCell);
        row.appendChild(scoreCell);
        row.appendChild(visitorTeamCell);
        row.appendChild(statusCell);

        resultsBody.appendChild(row);
    });
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
});
