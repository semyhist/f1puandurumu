// Takım verileri
const TEAMS = {
    "Red Bull": {
        abbreviation: "RB",
        color: "#0600EF",
        cssClass: "redbull",
        logo: "https://pngimg.com/d/red_bull_PNG12.png"
    },
    "Ferrari": {
        abbreviation: "FER",
        color: "#DC0000",
        cssClass: "ferrari",
        logo: "https://upload.wikimedia.org/wikipedia/ru/thumb/c/c0/Scuderia_Ferrari_Logo.svg/1514px-Scuderia_Ferrari_Logo.svg.png"
    },
    "Mercedes": {
        abbreviation: "MER",
        color: "#00D2BE",
        cssClass: "mercedes",
        logo: "https://cdn.freebiesupply.com/logos/large/2x/mercedes-benz-9-logo-svg-vector.svg"
    },
    "Alpine": {
        abbreviation: "ALP",
        color: "#0090FF",
        cssClass: "alpine",
        logo: "https://download.logo.wine/logo/Alpine_(automobile)/Alpine_(automobile)-Logo.wine.png"
    },
    "McLaren": {
        abbreviation: "MCL",
        color: "#FF8700",
        cssClass: "mclaren",
        logo: "https://ecareauto.ae/assets/cache_image/images/brands/new/mclaren_630x594_5bd.webp"
    },
    "Aston Martin": {
        abbreviation: "AM",
        color: "#006F62",
        cssClass: "aston",
        logo: "https://cdn.freebiesupply.com/logos/large/2x/aston-martin-logo-png-transparent.png"
    },
    "Alfa Romeo": {
        abbreviation: "AR",
        color: "#900000",
        cssClass: "alfa",
        logo: "https://www.cdnlogo.com/logos/a/75/alfa-romeo.svg"
    },
    "Haas": {
        abbreviation: "HAS",
        color: "#FFFFFF",
        cssClass: "haas",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_Haas_F1.png/800px-Logo_Haas_F1.png"
    },
    "Alpha Tauri": {
        abbreviation: "AT",
        color: "#2B4562",
        cssClass: "alphatauri",
        logo: "https://www.webcarstory.com/logos/2531.png"
    },
    "Williams": {
        abbreviation: "WIL",
        color: "#005AFF",
        cssClass: "williams",
        logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Logo_Williams_F1.png"
    }
};

const RACES = [
    "ISP", "AUS", "AZE", "CAN", "HUN", "SPA", "SIN", "MON",
    "SIL", "BRA", "BAH", "ABU"
];

let teamPerformanceChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Tema kontrolü
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Tarih bilgisini ayarla
    updateDate();
    
    // Tab sistemini ayarla
    setupTabs();
    
    // Yarış seçiciyi ayarla
    setupRaceSelector();
    
    // Verileri yükle
    loadData();
    
    // Tema değiştirme butonu
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Grafik temasını güncelle
    if (teamPerformanceChart) {
        updateChartTheme();
    }
}

function updateChartTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#333333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    if (teamPerformanceChart) {
        teamPerformanceChart.options.scales.x.grid.color = gridColor;
        teamPerformanceChart.options.scales.y.grid.color = gridColor;
        teamPerformanceChart.options.scales.x.ticks.color = textColor;
        teamPerformanceChart.options.scales.y.ticks.color = textColor;
        teamPerformanceChart.options.plugins.legend.labels.color = textColor;
        teamPerformanceChart.update();
    }
}

function updateDate() {
    const dateElement = document.getElementById('current-date');
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('tr-TR', options);
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Tüm tab butonlarından active classını kaldır
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.querySelector('.underline').style.width = '0';
            });
            
            // Tıklanan butona active classını ekle
            this.classList.add('active');
            this.querySelector('.underline').style.width = '100%';
            
            // Tüm tab içeriklerini gizle
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // İlgili tab içeriğini göster
            const tabName = this.dataset.tab;
            const tabContent = document.getElementById(`${tabName}-content`);
            tabContent.classList.add('active');
        });
    });
}

function setupRaceSelector() {
    const select = document.getElementById('race-select');
    
    RACES.forEach(race => {
        const option = document.createElement('option');
        option.value = race;
        option.textContent = race;
        select.appendChild(option);
    });
    
    select.addEventListener('change', showRaceResults);
}

async function showRaceResults(event) {
    const raceName = event.target.value;
    if (!raceName) return;

    try {
        const response = await fetch('puanlar.xlsx');
        if (!response.ok) throw new Error('Dosya bulunamadı');
        
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const raceIndex = RACES.indexOf(raceName) + 1; // +1 because first column is name
        const results = processRaceData(jsonData, raceIndex);
        
        displayRaceResults(results, raceName);
    } catch (error) {
        console.error("Yarış sonuçları yüklenirken hata:", error);
        showError(error, 'race-results');
    }
}

function processRaceData(data, raceIndex) {
    return data.slice(1)
        .filter(row => row && row.length > raceIndex && row[0])
        .map(row => {
            let points = 0;
            if (typeof row[raceIndex] === 'number') {
                points = row[raceIndex];
            } else if (!isNaN(parseFloat(row[raceIndex]))) {
                points = parseFloat(row[raceIndex]);
            }
            
            const teamName = row[14];
            const team = TEAMS[teamName] || {};
            
            return {
                name: row[0].toUpperCase(),
                points: points,
                team: teamName,
                ...team
            };
        })
        .sort((a, b) => b.points - a.points);
}

function displayRaceResults(results, raceName) {
    const container = document.getElementById('race-results');
    container.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = `${raceName} Yarış Sonuçları`;
    title.className = 'race-title animate__animated animate__fadeIn';
    container.appendChild(title);
    
    if (results.length === 0) {
        container.innerHTML += '<p class="no-results animate__animated animate__fadeIn">Bu yarış için sonuç bulunamadı</p>';
        return;
    }
    
    results.forEach((driver, index) => {
        const driverElement = document.createElement('div');
        driverElement.className = `driver driver-${driver.cssClass} animate__animated animate__fadeInUp`;
        driverElement.style.animationDelay = `${index * 50}ms`;
        
        driverElement.innerHTML = `
            <span class="position">${index + 1}</span>
            <img src="${driver.logo}" alt="${driver.team}" class="team-logo" loading="lazy">
            <span class="name">${driver.name}</span>
            <span class="points">${driver.points || '-'}</span>
        `;
        
        if (driver.points === 0) {
            driverElement.classList.add('no-points');
        }
        
        container.appendChild(driverElement);
    });
}

async function loadData() {
    try {
        showLoading();
        
        const response = await fetch('puanlar.xlsx');
        if (!response.ok) throw new Error('Dosya bulunamadı');
        
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        displayDrivers(processDriverData(jsonData));
        displayTeams(calculateTeamPoints(jsonData));
        displayTeamPerformanceChart(jsonData);
        
    } catch (error) {
        console.error("Veri yükleme hatası:", error);
        showError(error, 'drivers-leaderboard');
    }
}

function showLoading() {
    const driversBoard = document.getElementById('drivers-leaderboard');
    const teamsBoard = document.getElementById('teams-leaderboard');
    
    driversBoard.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Veriler yükleniyor...</p>
        </div>
    `;
    
    teamsBoard.innerHTML = '';
}

function processDriverData(data) {
    return data.slice(1)
        .filter(row => row && row.length >= 15 && row[0] && row[14])
        .map(row => {
            let points = 0;
            if (typeof row[13] === 'number') {
                points = row[13];
            } else if (!isNaN(parseFloat(row[13]))) {
                points = parseFloat(row[13]);
            }
            
            const teamName = row[14];
            const team = TEAMS[teamName] || {};
            
            return {
                name: row[0].toUpperCase(),
                points: points,
                team: teamName,
                ...team
            };
        });
}

function calculateTeamPoints(data) {
    const teamPoints = {};
    
    data.slice(1).forEach(row => {
        if (!row || row.length < 15 || !row[14]) return;
        
        const teamName = row[14];
        if (!teamPoints[teamName]) {
            teamPoints[teamName] = {
                name: teamName,
                points: 0,
                ...TEAMS[teamName]
            };
        }
        
        let points = 0;
        if (typeof row[13] === 'number') {
            points = row[13];
        } else if (!isNaN(parseFloat(row[13]))) {
            points = parseFloat(row[13]);
        }
        
        teamPoints[teamName].points += points;
    });
    
    return Object.values(teamPoints);
}

function displayDrivers(drivers) {
    const leaderboard = document.getElementById('drivers-leaderboard');
    leaderboard.innerHTML = '';
    
    drivers
        .sort((a, b) => b.points - a.points)
        .forEach((driver, index) => {
            const delay = index * 50;
            
            const driverElement = document.createElement('div');
            driverElement.className = `driver driver-${driver.cssClass} animate__animated animate__fadeInUp`;
            driverElement.style.animationDelay = `${delay}ms`;
            
            if (driver.points === 0) {
                driverElement.classList.add('no-points');
                driverElement.innerHTML = `
                    <span class="position">${index + 1}</span>
                    <img src="${driver.logo}" alt="${driver.team}" class="team-logo" loading="lazy">
                    <span class="name">${driver.name}</span>
                    <span class="points">-</span>
                `;
            } else {
                driverElement.innerHTML = `
                    <span class="position">${index + 1}</span>
                    <img src="${driver.logo}" alt="${driver.team}" class="team-logo" loading="lazy">
                    <span class="name">${driver.name}</span>
                    <span class="points">${driver.points}</span>
                `;
            }
            
            leaderboard.appendChild(driverElement);
        });
}

function displayTeams(teams) {
    const leaderboard = document.getElementById('teams-leaderboard');
    leaderboard.innerHTML = '';
    
    teams
        .sort((a, b) => b.points - a.points)
        .forEach((team, index) => {
            const delay = index * 50;
            
            const teamElement = document.createElement('div');
            teamElement.className = `team team-${team.cssClass} animate__animated animate__fadeInUp`;
            teamElement.style.animationDelay = `${delay}ms`;
            
            teamElement.innerHTML = `
                <span class="position">${index + 1}</span>
                <img src="${team.logo}" alt="${team.name}" class="team-logo" loading="lazy">
                <span class="name">${team.name.toUpperCase()}</span>
                <span class="points">${team.points}</span>
            `;
            
            leaderboard.appendChild(teamElement);
        });
}

function displayTeamPerformanceChart(data) {
    const ctx = document.getElementById('team-performance-chart').getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#333333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Takım verilerini işle
    const teamData = {};
    
    // Tüm takımları başlat
    Object.keys(TEAMS).forEach(team => {
        teamData[team] = {
            points: Array(RACES.length).fill(null),
            total: 0
        };
    });
    
    // Son yapılan yarışın indeksini bul
    let lastRaceIndex = RACES.length - 1;
    for (let i = 0; i < RACES.length; i++) {
        const raceIndex = i + 1; // Excel'deki sütun indeksi
        let raceHasData = false;
        
        data.slice(1).forEach(row => {
            if (!row || row.length <= raceIndex || !row[14]) return;
            
            const points = row[raceIndex];
            if (typeof points === 'number' || (!isNaN(parseFloat(points)) && points !== '')) {
                raceHasData = true;
            }
        });
        
        if (!raceHasData) {
            lastRaceIndex = i - 1;
            break;
        }
    }
    
    // Her yarış için kümülatif puanları hesapla
    for (let i = 0; i < RACES.length; i++) {
        const raceIndex = i + 1; // Excel'deki sütun indeksi
        
        data.slice(1).forEach(row => {
            if (!row || row.length <= raceIndex || !row[14]) return;
            
            const teamName = row[14];
            if (!teamData[teamName]) return;
            
            let points = 0;
            if (typeof row[raceIndex] === 'number') {
                points = row[raceIndex];
            } else if (!isNaN(parseFloat(row[raceIndex]))) {
                points = parseFloat(row[raceIndex]);
            } else if (i > lastRaceIndex) {
                // Yarış yapılmadıysa null olarak bırak
                return;
            }
            
            // Kümülatif toplamı güncelle
            if (i === 0) {
                teamData[teamName].points[i] = points;
            } else {
                teamData[teamName].points[i] = (teamData[teamName].points[i-1] || 0) + points;
            }
            
            teamData[teamName].total += points;
        });
    }
    
    // Sıralama yap (en çok puan alandan en aza)
    const sortedTeams = Object.entries(teamData)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 10); // En iyi 10 takım
    
    // Grafik verilerini hazırla
    const chartData = {
        labels: RACES,
        datasets: sortedTeams.map(([teamName, data]) => ({
            label: TEAMS[teamName].abbreviation,
            data: data.points,
            borderColor: TEAMS[teamName].color,
            backgroundColor: TEAMS[teamName].color + '40', // %25 opacity
            borderWidth: 2,
            tension: 0.3,
            pointRadius: function(context) {
                return context.dataIndex <= lastRaceIndex ? 4 : 0;
            },
            pointHoverRadius: function(context) {
                return context.dataIndex <= lastRaceIndex ? 6 : 0;
            },
            segment: {
                borderColor: function(context) {
                    return context.p1DataIndex <= lastRaceIndex ? TEAMS[teamName].color : 'transparent';
                }
            },
            spanGaps: true
        }))
    };
    
    // Grafik ayarları
    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Teko',
                            size: 14
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    bodyFont: {
                        family: 'Teko',
                        size: 16
                    },
                    titleFont: {
                        family: 'Teko',
                        size: 14
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw !== null ? context.raw : 'Veri yok';
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Teko',
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Teko',
                            size: 12
                        },
                        callback: function(value) {
                            if (value % 1 === 0) {
                                return value;
                            }
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };
    
    // Eski grafiği temizle
    if (teamPerformanceChart) {
        teamPerformanceChart.destroy();
    }
    
    // Yeni grafiği oluştur
    teamPerformanceChart = new Chart(ctx, config);
}

function showError(error, elementId = 'drivers-leaderboard') {
    const errorHTML = `
        <div class="error animate__animated animate__shakeX">
            <p>VERİLER YÜKLENİRKEN HATA OLUŞTU</p>
            <small>${error.message}</small>
        </div>
    `;
    
    document.getElementById(elementId).innerHTML = errorHTML;
}