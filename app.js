// ============================================
// VARIABLES GLOBALES Y DATOS
// ============================================

let interpolationChart = null;
let differentialChart = null;

// Datos de interpolación
const interpolationData = {
    x: [6, 8, 12, 16, 20],
    y: [45, 52, 65, 70, 58]
};

// Datos de integración
const integrationData = {
    depth: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
    velocity: [0, 0.8, 1.2, 1.5, 1.3, 0.9, 0]
};

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================

function switchTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado
    document.getElementById(tabName).classList.add('active');
    
    // Actualizar botones de pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Recalcular al cambiar pestaña
    if (tabName === 'interpolation') {
        calculateInterpolation();
    } else if (tabName === 'differential') {
        calculateDifferential();
    } else if (tabName === 'integration') {
        calculateIntegration();
    }
}

function calculateInterpolation() {
    const x = parseFloat(document.getElementById('interp-point').value);
    const xi = interpolationData.x;
    const yi = interpolationData.y;
    
    // Validar entrada
    if (x < 6 || x > 20) {
        alert('Por favor, ingresa una hora entre 6 y 20');
        return;
    }
    
    // Calcular con todos los métodos
    const lagrangeResult = lagrangeInterpolation(x, xi, yi);
    const newtonResult = newtonInterpolation(x, xi, yi);
    const splineResult = cubicSpline(x, xi, yi);
    
    // Mostrar resultados
    const resultsDiv = document.getElementById('interpolation-results');
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>Lagrange</h3>
            <div class="result-value">${lagrangeResult.toFixed(4)} ppm</div>
            <p>Polinomio de grado ${xi.length-1}</p>
        </div>
        <div class="result-card">
            <h3>Newton</h3>
            <div class="result-value">${newtonResult.toFixed(4)} ppm</div>
            <p>Diferencias divididas</p>
        </div>
        <div class="result-card">
            <h3>Spline Cúbico</h3>
            <div class="result-value">${splineResult.toFixed(4)} ppm</div>
            <p>Interpolación por tramos</p>
        </div>
    `;
    
    // Actualizar gráfico
    updateInterpolationChart(x, xi, yi, lagrangeResult, newtonResult, splineResult);
}

function calculateDifferential() {
    const h = parseFloat(document.getElementById('step-size').value);
    const tEnd = parseFloat(document.getElementById('end-time').value);
    const k = 0.2;
    const C0 = 100;
    
    // Validar entradas
    if (h <= 0 || tEnd <= 0) {
        alert('Los valores deben ser mayores que 0');
        return;
    }
    
    // Calcular con todos los métodos
    const euler = eulerMethod(k, C0, h, tEnd);
    const heun = heunMethod(k, C0, h, tEnd);
    const rk4 = rk4Method(k, C0, h, tEnd);
    
    // Solución exacta
    const exactSolution = C0 * Math.exp(-k * tEnd);
    
    // Mostrar resultados
    const resultsDiv = document.getElementById('differential-results');
    const eulerError = Math.abs((euler.C[euler.C.length-1] - exactSolution) / exactSolution * 100);
    const heunError = Math.abs((heun.C[heun.C.length-1] - exactSolution) / exactSolution * 100);
    const rk4Error = Math.abs((rk4.C[rk4.C.length-1] - exactSolution) / exactSolution * 100);
    
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>Euler</h3>
            <div class="result-value">${euler.C[euler.C.length-1].toFixed(4)} mg/L</div>
            <div class="error">Error: ${eulerError.toFixed(2)}%</div>
            <p>${euler.C.length-1} iteraciones</p>
        </div>
        <div class="result-card">
            <h3>Heun</h3>
            <div class="result-value">${heun.C[heun.C.length-1].toFixed(4)} mg/L</div>
            <div class="error">Error: ${heunError.toFixed(2)}%</div>
            <p>Método predictor-corrector</p>
        </div>
        <div class="result-card">
            <h3>Runge-Kutta 4°</h3>
            <div class="result-value">${rk4.C[rk4.C.length-1].toFixed(4)} mg/L</div>
            <div class="error">Error: ${rk4Error.toFixed(2)}%</div>
            <p>Solución más precisa</p>
        </div>
        <div class="result-card">
            <h3>Solución Exacta</h3>
            <div class="result-value">${exactSolution.toFixed(4)} mg/L</div>
            <div style="color: #10b981; font-weight: 600;">Referencia</div>
            <p>C(t) = 100·e^(-0.2t)</p>
        </div>
    `;
    
    // Actualizar gráfico
    updateDifferentialChart(euler, heun, rk4, exactSolution, tEnd);
}

function calculateIntegration() {
    const width = parseFloat(document.getElementById('river-width').value);
    const velocity = integrationData.velocity;
    const depth = integrationData.depth;
    
    // Validar entrada
    if (width <= 0) {
        alert('El ancho del río debe ser mayor que 0');
        return;
    }
    
    // Calcular con todos los métodos
    const trapezoidResult = trapezoidalRule(velocity, depth, width);
    const simpson13Result = simpson13Rule(velocity, depth, width);
    const simpson38Result = simpson38Rule(velocity, depth, width);
    
    // Mostrar resultados
    const resultsDiv = document.getElementById('integration-results');
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>Trapecio</h3>
            <div class="result-value">${trapezoidResult.toFixed(4)} m³/s</div>
            <p>Regla compuesta del trapecio</p>
        </div>
        <div class="result-card">
            <h3>Simpson 1/3</h3>
            <div class="result-value">${simpson13Result ? simpson13Result.toFixed(4) : 'No aplicable'} m³/s</div>
            <p>Requiere puntos impares (7 puntos disponibles)</p>
        </div>
        <div class="result-card">
            <h3>Simpson 3/8</h3>
            <div class="result-value">${simpson38Result ? simpson38Result.toFixed(4) : 'No aplicable'} m³/s</div>
            <p>Usa grupos de 4 puntos</p>
        </div>
    `;
    
    // Actualizar tabla comparativa
    updateIntegrationTable(trapezoidResult, simpson13Result, simpson38Result);
}

// ============================================
// FUNCIONES DE GRÁFICOS
// ============================================

function updateInterpolationChart(xPoint, xi, yi, lagrangeResult, newtonResult, splineResult) {
    const ctx = document.getElementById('interpolation-chart').getContext('2d');
    
    // Generar puntos para las curvas
    const xValues = [];
    const lagrangeValues = [];
    const splineValues = [];
    
    for (let x = 6; x <= 20; x += 0.1) {
        xValues.push(x);
        lagrangeValues.push(lagrangeInterpolation(x, xi, yi));
        splineValues.push(cubicSpline(x, xi, yi));
    }
    
    if (interpolationChart) {
        interpolationChart.destroy();
    }
    
    interpolationChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Datos Originales',
                    data: xi.map((x, i) => ({x: x, y: yi[i]})),
                    backgroundColor: 'rgb(239, 68, 68)',
                    borderColor: 'rgb(239, 68, 68)',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    fill: false
                },
                {
                    label: 'Lagrange/Newton',
                    data: xValues.map((x, i) => ({x: x, y: lagrangeValues[i]})),
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Spline Cúbico',
                    data: xValues.map((x, i) => ({x: x, y: splineValues[i]})),
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Punto Interpolado',
                    data: [{x: xPoint, y: lagrangeResult}],
                    backgroundColor: 'rgb(245, 158, 11)',
                    pointRadius: 10,
                    pointHoverRadius: 12
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Hora del día'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Concentración (ppm)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación de Métodos de Interpolación'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ppm`;
                        }
                    }
                }
            }
        }
    });
}

function updateDifferentialChart(euler, heun, rk4, exactSolution, tEnd) {
    const ctx = document.getElementById('differential-chart').getContext('2d');
    
    // Función exacta para graficar
    const exactValues = [];
    const tValues = [];
    for (let t = 0; t <= tEnd * 1.1; t += 0.05) {
        tValues.push(t);
        exactValues.push(100 * Math.exp(-0.2 * t));
    }
    
    if (differentialChart) {
        differentialChart.destroy();
    }
    
    differentialChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Solución Exacta',
                    data: tValues.map((t, i) => ({x: t, y: exactValues[i]})),
                    borderColor: 'rgb(0, 0, 0)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Método de Euler',
                    data: euler.t.map((t, i) => ({x: t, y: euler.C[i]})),
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 2,
                    pointRadius: 4,
                    fill: false
                },
                {
                    label: 'Método de Heun',
                    data: heun.t.map((t, i) => ({x: t, y: heun.C[i]})),
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    pointRadius: 4,
                    fill: false
                },
                {
                    label: 'Runge-Kutta 4°',
                    data: rk4.t.map((t, i) => ({x: t, y: rk4.C[i]})),
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 2,
                    pointRadius: 4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Tiempo (horas)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Concentración (mg/L)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación de Métodos para Ecuaciones Diferenciales'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} mg/L`;
                        }
                    }
                }
            }
        }
    });
}

function updateIntegrationTable(trapezoidResult, simpson13Result, simpson38Result) {
    const tableBody = document.getElementById('integration-table');
    
    const reference = simpson13Result || trapezoidResult;
    const trapezoidError = reference ? Math.abs((trapezoidResult - reference)/reference*100).toFixed(2) : 'N/A';
    const simpson38Error = (simpson13Result && simpson38Result) ? 
        Math.abs((simpson38Result - simpson13Result)/simpson13Result*100).toFixed(2) : 'N/A';
    
    tableBody.innerHTML = `
        <tr>
            <td><strong>Regla del Trapecio</strong></td>
            <td>${trapezoidResult.toFixed(4)} m³/s</td>
            <td>${trapezoidError}%</td>
            <td>Bueno para datos irregulares, fácil de implementar</td>
        </tr>
        <tr>
            <td><strong>Simpson 1/3</strong></td>
            <td>${simpson13Result ? simpson13Result.toFixed(4) + ' m³/s' : 'No aplicable'}</td>
            <td>0.00%</td>
            <td>Método de referencia para funciones suaves, alta precisión</td>
        </tr>
        <tr>
            <td><strong>Simpson 3/8</strong></td>
            <td>${simpson38Result ? simpson38Result.toFixed(4) + ' m³/s' : 'No aplicable'}</td>
            <td>${simpson38Error}%</td>
            <td>Complemento cuando el número de puntos no es impar</td>
        </tr>
    `;
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos de pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Configurar eventos de entrada para calcular automáticamente
    document.getElementById('interp-point').addEventListener('input', calculateInterpolation);
    document.getElementById('step-size').addEventListener('input', calculateDifferential);
    document.getElementById('end-time').addEventListener('input', calculateDifferential);
    document.getElementById('river-width').addEventListener('input', calculateIntegration);
    
    // Configurar eventos de selección de métodos
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.method-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Calcular inicialmente
    calculateInterpolation();
    calculateDifferential();
    calculateIntegration();
    
    console.log(' Aplicación de Métodos Numéricos cargada correctamente');
    console.log(' Problemas implementados:');
    console.log('  1. Interpolación: Contaminante ambiental');
    console.log('  2. EDOs: Farmacocinética');
    console.log('  3. Integración: Caudal de río');
});