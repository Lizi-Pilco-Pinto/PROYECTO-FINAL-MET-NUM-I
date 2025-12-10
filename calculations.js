// ============================================
// FUNCIONES DE INTERPOLACIÓN
// ============================================

function lagrangeInterpolation(x, xi, yi) {
    let result = 0;
    const n = xi.length;
    
    for (let i = 0; i < n; i++) {
        let term = yi[i];
        for (let j = 0; j < n; j++) {
            if (j !== i) {
                term *= (x - xi[j]) / (xi[i] - xi[j]);
            }
        }
        result += term;
    }
    return result;
}

function newtonInterpolation(x, xi, yi) {
    const n = xi.length;
    const f = [];
    
    // Inicializar tabla de diferencias divididas
    for (let i = 0; i < n; i++) {
        f[i] = [];
        f[i][0] = yi[i];
    }
    
    // Calcular diferencias divididas
    for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
            f[i][j] = (f[i+1][j-1] - f[i][j-1]) / (xi[i+j] - xi[i]);
        }
    }
    
    // Evaluar polinomio
    let result = f[0][0];
    let product = 1;
    
    for (let i = 1; i < n; i++) {
        product *= (x - xi[i-1]);
        result += f[0][i] * product;
    }
    
    return result;
}

function cubicSpline(x, xi, yi) {
    const n = xi.length;
    
    // Si x está fuera del rango, devolver el valor más cercano
    if (x <= xi[0]) return yi[0];
    if (x >= xi[n-1]) return yi[n-1];
    
    // Encontrar el intervalo donde está x
    let interval = 0;
    while (x > xi[interval + 1] && interval < n - 2) {
        interval++;
    }
    
    // Para simplificar, usaremos interpolación lineal en este ejemplo
    // (Una implementación completa de spline cúbico es más compleja)
    const x1 = xi[interval];
    const x2 = xi[interval + 1];
    const y1 = yi[interval];
    const y2 = yi[interval + 1];
    
    // Interpolación lineal como aproximación
    return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

// ============================================
// FUNCIONES DE ECUACIONES DIFERENCIALES
// ============================================

function eulerMethod(k, C0, h, tEnd) {
    const steps = Math.ceil(tEnd / h);
    const C = [C0];
    const t = [0];
    
    for (let i = 0; i < steps; i++) {
        const dC = -k * C[i];
        C.push(C[i] + h * dC);
        t.push(t[i] + h);
    }
    
    // Asegurar que llegamos exactamente a tEnd
    if (t[t.length-1] > tEnd) {
        const lastStep = tEnd - t[t.length-2];
        const lastC = C[C.length-2] + lastStep * (-k * C[C.length-2]);
        C[C.length-1] = lastC;
        t[t.length-1] = tEnd;
    }
    
    return {t, C};
}

function heunMethod(k, C0, h, tEnd) {
    const steps = Math.ceil(tEnd / h);
    const C = [C0];
    const t = [0];
    
    for (let i = 0; i < steps; i++) {
        const predictor = -k * C[i];
        const Cp = C[i] + h * predictor;
        const corrector = -k * Cp;
        C.push(C[i] + h/2 * (predictor + corrector));
        t.push(t[i] + h);
    }
    
    // Ajuste para tiempo final exacto
    if (t[t.length-1] > tEnd) {
        const lastStep = tEnd - t[t.length-2];
        const predictor = -k * C[C.length-2];
        const Cp = C[C.length-2] + lastStep * predictor;
        const corrector = -k * Cp;
        C[C.length-1] = C[C.length-2] + lastStep/2 * (predictor + corrector);
        t[t.length-1] = tEnd;
    }
    
    return {t, C};
}

function rk4Method(k, C0, h, tEnd) {
    const steps = Math.ceil(tEnd / h);
    const C = [C0];
    const t = [0];
    
    for (let i = 0; i < steps; i++) {
        const k1 = -k * C[i];
        const k2 = -k * (C[i] + h/2 * k1);
        const k3 = -k * (C[i] + h/2 * k2);
        const k4 = -k * (C[i] + h * k3);
        
        C.push(C[i] + h/6 * (k1 + 2*k2 + 2*k3 + k4));
        t.push(t[i] + h);
    }
    
    // Ajuste para tiempo final exacto
    if (t[t.length-1] > tEnd) {
        const lastStep = tEnd - t[t.length-2];
        const k1 = -k * C[C.length-2];
        const k2 = -k * (C[C.length-2] + lastStep/2 * k1);
        const k3 = -k * (C[C.length-2] + lastStep/2 * k2);
        const k4 = -k * (C[C.length-2] + lastStep * k3);
        
        C[C.length-1] = C[C.length-2] + lastStep/6 * (k1 + 2*k2 + 2*k3 + k4);
        t[t.length-1] = tEnd;
    }
    
    return {t, C};
}

// ============================================
// FUNCIONES DE INTEGRACIÓN NUMÉRICA
// ============================================

function trapezoidalRule(velocity, depth, width) {
    const n = velocity.length;
    let sum = velocity[0] + velocity[n-1];
    
    for (let i = 1; i < n-1; i++) {
        sum += 2 * velocity[i];
    }
    
    const h = depth[1] - depth[0];
    return width * h/2 * sum;
}

function simpson13Rule(velocity, depth, width) {
    const n = velocity.length;
    if (n % 2 === 0) {
        // Si es par, no podemos usar Simpson 1/3 directamente
        return null;
    }
    
    let sum = velocity[0] + velocity[n-1];
    
    // Términos impares (índices 1, 3, 5, ...)
    for (let i = 1; i < n-1; i += 2) {
        sum += 4 * velocity[i];
    }
    
    // Términos pares (índices 2, 4, 6, ...)
    for (let i = 2; i < n-1; i += 2) {
        sum += 2 * velocity[i];
    }
    
    const h = depth[1] - depth[0];
    return width * h/3 * sum;
}

function simpson38Rule(velocity, depth, width) {
    const n = velocity.length;
    if (n < 4) return null;
    
    const h = depth[1] - depth[0];
    let sum = 0;
    
    // Aplicar Simpson 3/8 a grupos de 4 puntos
    const groups = Math.floor((n - 1) / 3);
    
    for (let g = 0; g < groups; g++) {
        const i = g * 3;
        sum += (3*h/8) * (
            velocity[i] + 
            3*velocity[i+1] + 
            3*velocity[i+2] + 
            velocity[i+3]
        );
    }
    
    // Si quedan puntos, aplicar regla del trapecio
    const remaining = (n - 1) % 3;
    if (remaining > 0) {
        const start = groups * 3;
        for (let i = start; i < n - 1; i++) {
            sum += h/2 * (velocity[i] + velocity[i+1]);
        }
    }
    
    return width * sum;
}