// Takım verileri (güncellenmiş logo linkleriyle)
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

document.addEventListener('DOMContentLoaded', function() {
    // Tarih bilgisini ayarla
    updateDate();
    
    // Tab sistemini ayarla
    setupTabs();
    
    // Verileri yükle
    loadData();
});

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
            
            // Animasyon ekle
            tabContent.classList.add('animate__animated', 'animate__fadeIn');
        });
    });
}

async function loadData() {
    try {
        // Yükleme animasyonunu göster
        showLoading();
        
        // Excel dosyasını yükle
        const response = await fetch('puanlar.xlsx');
        if (!response.ok) throw new Error('Dosya bulunamadı');
        
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const drivers = processDriverData(jsonData);
        
        // Verileri göster
        displayDrivers(drivers);
        displayTeams(calculateTeamPoints(drivers));
        
    } catch (error) {
        console.error("Veri yükleme hatası:", error);
        showError(error);
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
    return data.slice(1) // Başlık satırını atla
        .filter(row => row && row.length >= 15 && row[0] && row[14]) // Geçerli satırları filtrele
        .map(row => {
            // Puanı sayıya çevir (tarih formatındakileri 0 yap)
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

function calculateTeamPoints(drivers) {
    const teamPoints = {};
    
    drivers.forEach(driver => {
        if (!teamPoints[driver.team]) {
            teamPoints[driver.team] = {
                name: driver.team,
                points: 0,
                ...TEAMS[driver.team]
            };
        }
        teamPoints[driver.team].points += driver.points;
    });
    
    return Object.values(teamPoints);
}

function displayDrivers(drivers) {
    const leaderboard = document.getElementById('drivers-leaderboard');
    leaderboard.innerHTML = '';
    
    drivers
        .sort((a, b) => b.points - a.points)
        .forEach((driver, index) => {
            // Her öğe için gecikmeli animasyon
            const delay = index * 50;
            
            const driverElement = document.createElement('div');
            driverElement.className = `driver driver-${driver.cssClass}`;
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
            // Her öğe için gecikmeli animasyon
            const delay = index * 50;
            
            const teamElement = document.createElement('div');
            teamElement.className = `team team-${team.cssClass}`;
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

function showError(error) {
    const errorHTML = `
        <div class="error animate__animated animate__shakeX">
            <p>VERİLER YÜKLENİRKEN HATA OLUŞTU</p>
            <small>${error.message}</small>
        </div>
    `;
    
    document.getElementById('drivers-leaderboard').innerHTML = errorHTML;
}