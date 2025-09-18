// Configuração dos gráficos
let umidadeChart, temperaturaChart;

// Inicializar gráficos
function initCharts() {
    const umidadeCtx = document.getElementById('umidadeChart').getContext('2d');
    const temperaturaCtx = document.getElementById('temperaturaChart').getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Valor'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Data/Hora'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    };
    
    umidadeChart = new Chart(umidadeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Umidade',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: chartOptions
    });
    
    temperaturaChart = new Chart(temperaturaCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: chartOptions
    });
}

// Buscar dados da API
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        updateCharts(data);
        updateStats(data);
        updateLastUpdateTime();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
    }
}

// Atualizar gráficos com novos dados
function updateCharts(data) {
    // Atualizar gráfico de umidade
    umidadeChart.data.labels = data.timestamps;
    umidadeChart.data.datasets[0].data = data.umidade;
    umidadeChart.update();
    
    // Atualizar gráfico de temperatura
    temperaturaChart.data.labels = data.timestamps;
    temperaturaChart.data.datasets[0].data = data.temperatura;
    temperaturaChart.update();
}

// Atualizar estatísticas
function updateStats(data) {
    if (data.umidade.length > 0 && data.temperatura.length > 0) {
        // Últimos valores
        document.getElementById('currentHumidity').textContent = 
            `${data.umidade[data.umidade.length - 1]}%`;
        document.getElementById('currentTemperature').textContent = 
            `${data.temperatura[data.temperatura.length - 1]}°C`;
        
        // Calcular médias
        const avgHumidity = data.umidade.reduce((a, b) => a + b, 0) / data.umidade.length;
        const avgTemperature = data.temperatura.reduce((a, b) => a + b, 0) / data.temperatura.length;
        
        document.getElementById('averageValues').textContent = 
            `${avgHumidity.toFixed(1)}% / ${avgTemperature.toFixed(1)}°C`;
    }
}

// Atualizar hora da última atualização
function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        `Última atualização: ${now.toLocaleTimeString()}`;
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    fetchData();
    
    // Configurar atualização ao clicar no botão
    document.getElementById('refreshBtn').addEventListener('click', fetchData);
    
    // Atualizar automaticamente a cada 5 minutos
    setInterval(fetchData, 5 * 60 * 1000);
});