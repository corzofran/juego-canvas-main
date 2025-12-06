/* Solución sin sprites
const canvas = document.getElementById("miCanvas");
const ctx = canvas.getContext("2d");

// --- 1. CONFIGURACIÓN DE IMÁGENES ---

// AQUÍ PONES TUS ARCHIVOS:
const rutasDeTusImagenes = [
    './assets/spaceship/1.png', // Frame 1
    './assets/spaceship/2.png', // Frame 2
    './assets/spaceship/3.png', // Frame 3
    './assets/spaceship/4.png', // Frame 4
    './assets/spaceship/5.png', // Frame 5
    './assets/spaceship/6.png', // Frame 6
    './assets/spaceship/7.png', // Frame 7
    './assets/spaceship/8.png', // Frame 8
];

const imagenesCargadas = []; // Aquí se guardarán los objetos imagen reales
let conteoCargas = 0;        // Para saber cuándo están listas

// Función para precargar todas las imágenes antes de jugar
function cargarRecursos() {
    rutasDeTusImagenes.forEach((ruta, index) => {
        const img = new Image();
        img.src = ruta;
        
        // Cuando una carga, sumamos al contador
        img.onload = () => {
            conteoCargas++;
            console.log(`Cargada imagen ${index + 1} de ${rutasDeTusImagenes.length}`);
            
            // Si ya cargaron TODAS (las 8), arrancamos el juego
            if (conteoCargas === rutasDeTusImagenes.length) {
                // Ordenamos el array para asegurar que el 1 es el 1 y el 2 es el 2
                // (A veces cargan en desorden por internet)
                loop(); 
            }
        };
        
        imagenesCargadas.push(img);
    });
}

// --- 2. OBJETOS ---

const Jugador = {
    x: canvas.width / 2 - 32,
    y: canvas.height - 100,
    ancho: 64,  // Tamaño visual en pantalla
    alto: 64,
    
    // ANIMACIÓN
    sprites: imagenesCargadas, // Referencia a nuestro array de fotos
    frameActual: 0,
    totalFrames: 8,            // Tienes 8 imágenes
    timerAnimacion: 0,
    velocidadAnimacion: 5      // Velocidad (menor = más rápido)
}

let bala = null;

function crearBala(x, y){
    return { color: "#ffff00", x: x, y: y, ancho: 5, alto: 15, active: true }
}

// --- 3. CONTROLES (Igual que antes) ---
const teclas = { Arriba: false, Abajo: false, Izquierda: false, Derecha: false }
let spaceKeyPressed = false;

window.addEventListener('keydown', (e) => { if(e.code === "Space") { e.preventDefault(); shoot(); } else moveOrStop(e.key, true) });
window.addEventListener('keyup', (e) => { if(e.code === "Space") spaceKeyPressed = false; else moveOrStop(e.key, false) });

function moveOrStop(key, move){
    switch(key) {
        case 'ArrowUp': case 'w': case 'W': teclas.Arriba = move; break;
        case 'ArrowDown': case 's': case 'S': teclas.Abajo = move; break;
        case 'ArrowLeft': case 'a': case 'A': teclas.Izquierda = move; break;
        case 'ArrowRight': case 'd': case 'D': teclas.Derecha = move; break;
    }
}

function shoot() {
    if(!spaceKeyPressed){
        // Ajustamos x + 32 (mitad de 64)
        bala = crearBala(Jugador.x + 32 - 2.5, Jugador.y);
        spaceKeyPressed = true;
    }
}

// --- 4. LÓGICA ---

function actualizar() {
    // Movimiento Jugador
    if(teclas.Arriba && Jugador.y > 0) Jugador.y -= 5
    if(teclas.Abajo && Jugador.y < (canvas.height - Jugador.alto)) Jugador.y += 5
    if(teclas.Izquierda && Jugador.x > 0) Jugador.x -=5
    if(teclas.Derecha && Jugador.x < canvas.width - Jugador.ancho) Jugador.x +=5
    
    // Movimiento Bala
    if(bala !== null && bala.active){
        bala.y -= 10;
        if (bala.y + bala.alto < 0) { bala.active = false; bala = null; }
    }

    // --- LÓGICA DE ANIMACIÓN ---
    Jugador.timerAnimacion++;
    if (Jugador.timerAnimacion > Jugador.velocidadAnimacion) {
        Jugador.frameActual++;
        
        // Si llegamos al final del array (8), volvemos a la imagen 0
        if (Jugador.frameActual >= Jugador.totalFrames) {
            Jugador.frameActual = 0;
        }
        Jugador.timerAnimacion = 0;
    }
}

function dibujar(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // --- DIBUJAR SPRITE ACTUAL ---
    // 1. Seleccionamos la foto correspondiente al frame actual
    let imagenParaDibujar = Jugador.sprites[Jugador.frameActual];

    // 2. Usamos el drawImage simple (Imagen, X, Y, Ancho, Alto)
    // OJO: Asegúrate de que la imagen haya cargado antes de dibujarla (el onload lo garantiza)
    if (imagenParaDibujar) {
            ctx.drawImage(
            imagenParaDibujar, 
            Jugador.x, 
            Jugador.y, 
            Jugador.ancho, 
            Jugador.alto
        );
    }
    
    // Dibujar Bala
    if (bala !== null && bala.active) {
        ctx.fillStyle = bala.color;
        ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
    }
}

function loop(){
    actualizar();
    dibujar();
    requestAnimationFrame(loop)
}

// --- INICIO ---
// En lugar de llamar a loop(), llamamos al cargador
cargarRecursos();*/

/* Solución con sprites */
const canvas = document.getElementById("miCanvas");
const ctx = canvas.getContext("2d");

// --- CONFIGURACIÓN DEL JUEGO ---
const imagenSprite = new Image();
imagenSprite.src = './assets/spaceship/space-ship_spritesheet.png'; 

const imagenEnemigoSprite = new Image();
imagenEnemigoSprite.src = './assets/spaceship/space-ship_spritesheet.png';

// --- SISTEMA DE PARTÍCULAS ---
let particulas = [];

function crearParticula(x, y, color, velocidad = 3) {
    return {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * velocidad,
        vy: (Math.random() - 0.5) * velocidad,
        vida: 30,
        color: color,
        tamaño: Math.random() * 4 + 2
    };
}

function crearExplosion(x, y, cantidad = 20) {
    const colores = ['#ff0000', '#ff8800', '#ffff00', '#ff4400'];
    for(let i = 0; i < cantidad; i++) {
        particulas.push(crearParticula(x, y, colores[Math.floor(Math.random() * colores.length)], 5));
    }
}

// --- ESTRELLAS DE FONDO ---
let estrellas = [];
for(let i = 0; i < 100; i++) {
    estrellas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        velocidad: Math.random() * 2 + 0.5,
        tamaño: Math.random() * 2
    });
}

// --- JUGADOR ---
const Jugador = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 100,
    ancho: 80,
    alto: 80,   
    
    sprite: imagenSprite,
    totalFrames: 8,
    frameActual: 0,
    
    anchoOriginalFrame: 0, 
    altoOriginalFrame: 0,

    timerAnimacion: 0,
    velocidadAnimacion: 4,
    
    // Sistema de dash
    dashDisponible: true,
    dashCooldown: 0,
    enDash: false,
    dashDuracion: 0,
    dashVelocidad: 15,
    
    tipoDisparo: 'normal',
    tiempoUltimoDisparo: 0,
    cooldownDisparo: 10,
    duracionPowerUp: 0,
    
    // Escudo
    tieneEscudo: false,
    duracionEscudo: 0
}

// --- ENEMIGOS MÚLTIPLES ---
let enemigos = [];

function crearEnemigo(x, y, tipo = 'normal') {
    const tipos = {
        normal: { vida: 10, velocidad: 4, puntos: 100, color: '#ff0000' },
        rapido: { vida: 5, velocidad: 8, puntos: 150, color: '#00ff00' },
        tanque: { vida: 25, velocidad: 2, puntos: 300, color: '#0000ff' },
        jefe: { vida: 50, velocidad: 3, puntos: 500, color: '#ff00ff' }
    };
    
    const config = tipos[tipo] || tipos.normal;
    
    return {
        x: x,
        y: y,
        ancho: tipo === 'jefe' ? 120 : 80,
        alto: tipo === 'jefe' ? 120 : 80,
        
        sprite: imagenEnemigoSprite,
        totalFrames: 8,
        frameActual: 0,
        
        anchoOriginalFrame: 0,
        altoOriginalFrame: 0,
        
        timerAnimacion: 0,
        velocidadAnimacion: 4,
        
        vida: config.vida,
        vidaMaxima: config.vida,
        
        velocidadX: config.velocidad,
        direccion: Math.random() > 0.5 ? 1 : -1,
        
        tiempoUltimoDisparo: 0,
        intervaloDisparo: tipo === 'jefe' ? 30 : 60,
        
        tipo: tipo,
        puntos: config.puntos,
        color: config.color
    };
}

let balasJugador = [];
let balasEnemigas = [];
let powerUps = [];
let comboActual = 0;
let tiempoCombo = 0;

// --- STATS DEL JUGADOR ---
const JugadorStats = {
    vida: 5,
    vidaMaxima: 5,
    invulnerable: false,
    tiempoInvulnerable: 0,
    escudo: 0
}

// --- SISTEMA DE JUEGO ---
let puntuacion = 0;
let nivel = 1;
let framesTotales = 0;
let oleadaActual = 0;
let enemigosEliminados = 0;
let tiempoEntreOleadas = 0;
let juegoIniciado = false;
let mejorPuntuacion = localStorage.getItem('bestScore') || 0;

// --- SISTEMA DE LOGROS ---
let logros = {
    primeraMuerte: false,
    combo10: false,
    nivel5: false,
    sinDaño: true
};

// --- BALAS ---
function crearBala(x, y, tipo = 'normal', angulo = 0) {
    const balas = {
        normal: { color: "#ffff00", ancho: 6, alto: 18, velocidad: 12, daño: 1 },
        triple: { color: "#00ffff", ancho: 5, alto: 15, velocidad: 12, daño: 1 },
        laser: { color: "#ff00ff", ancho: 8, alto: 30, velocidad: 15, daño: 2 },
        spread: { color: "#ff8800", ancho: 8, alto: 12, velocidad: 10, daño: 1 },
        plasma: { color: "#00ff00", ancho: 12, alto: 12, velocidad: 10, daño: 3 },
        enemigo: { color: "#ff0000", ancho: 6, alto: 18, velocidad: 7, daño: 1 }
    };
    
    const config = balas[tipo] || balas.normal;
    
    return {
        x: x,
        y: y,
        ancho: config.ancho,
        alto: config.alto,
        color: config.color,
        velocidad: config.velocidad,
        daño: config.daño,
        active: true,
        tipo: tipo,
        angulo: angulo,
        trail: [],
        rotacion: 0
    };
}

// --- POWER-UPS MEJORADOS ---
function crearPowerUp(x, y) {
    const tipos = ['triple', 'laser', 'spread', 'plasma', 'escudo', 'vida'];
    const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
    
    return {
        x: x,
        y: y,
        ancho: 30,
        alto: 30,
        tipo: tipoAleatorio,
        velocidad: 2,
        activo: true,
        parpadeo: 0,
        rotacion: 0
    };
}

// --- CONTROLES ---
const teclas = { Arriba: false, Abajo: false, Izquierda: false, Derecha: false, Espacio: false, Shift: false }

window.addEventListener('keydown', (e) => { 
    if(e.code === "Space") { 
        e.preventDefault(); 
        teclas.Espacio = true;
        
        // Iniciar juego
        if(!juegoIniciado) {
            juegoIniciado = true;
            iniciarOleada();
        }
    } else if(e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        teclas.Shift = true;
    } else moveOrStop(e.key, true);
});

window.addEventListener('keyup', (e) => { 
    if(e.code === "Space") {
        teclas.Espacio = false;
    } else if(e.code === "ShiftLeft" || e.code === "ShiftRight") {
        teclas.Shift = false;
    } else moveOrStop(e.key, false);
});

function moveOrStop(key, move){ 
    switch(key) { 
        case 'ArrowUp': case 'w': case 'W': teclas.Arriba = move; break; 
        case 'ArrowDown': case 's': case 'S': teclas.Abajo = move; break; 
        case 'ArrowLeft': case 'a': case 'A': teclas.Izquierda = move; break; 
        case 'ArrowRight': case 'd': case 'D': teclas.Derecha = move; break; 
    }
}

// --- SISTEMA DE DISPARO ---
function disparar() {
    const centroX = Jugador.x + (Jugador.ancho / 2);
    const centroY = Jugador.y;
    
    switch(Jugador.tipoDisparo) {
        case 'normal':
            balasJugador.push(crearBala(centroX - 3, centroY, 'normal'));
            break;
            
        case 'triple':
            balasJugador.push(crearBala(centroX - 3, centroY, 'triple', 0));
            balasJugador.push(crearBala(centroX - 20, centroY, 'triple', -0.3));
            balasJugador.push(crearBala(centroX + 14, centroY, 'triple', 0.3));
            break;
            
        case 'laser':
            balasJugador.push(crearBala(centroX - 4, centroY - 10, 'laser'));
            break;
            
        case 'spread':
            for(let i = -2; i <= 2; i++) {
                let angulo = i * 0.4;
                balasJugador.push(crearBala(centroX - 4, centroY, 'spread', angulo));
            }
            break;
            
        case 'plasma':
            balasJugador.push(crearBala(centroX - 6, centroY - 5, 'plasma'));
            for(let i = 0; i < 8; i++) {
                particulas.push(crearParticula(centroX, centroY, '#00ff00', 2));
            }
            break;
    }
}

// --- SISTEMA DE OLEADAS ---
function iniciarOleada() {
    oleadaActual++;
    let cantidadEnemigos = Math.min(2 + oleadaActual, 8);
    
    // Oleada especial cada 5 niveles: JEFE
    if(oleadaActual % 5 === 0) {
        enemigos.push(crearEnemigo(canvas.width / 2 - 60, 50, 'jefe'));
        console.log("¡JEFE APARECIÓ!");
    } else {
        for(let i = 0; i < cantidadEnemigos; i++) {
            let tipos = ['normal', 'normal', 'rapido', 'tanque'];
            let tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
            let x = Math.random() * (canvas.width - 100) + 50;
            let y = Math.random() * 100 + 30;
            let nuevoEnemigo = crearEnemigo(x, y, tipoAleatorio);
            nuevoEnemigo.anchoOriginalFrame = imagenEnemigoSprite.width / 8;
            nuevoEnemigo.altoOriginalFrame = imagenEnemigoSprite.height;
            enemigos.push(nuevoEnemigo);
        }
    }
}

// --- COLISIONES ---
function hayColision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.ancho &&
           obj1.x + obj1.ancho > obj2.x &&
           obj1.y < obj2.y + obj2.alto &&
           obj1.y + obj1.alto > obj2.y;
}

// --- ACTUALIZAR ---
function actualizar() {
    if(!juegoIniciado) return;
    
    framesTotales++;
    
    // Estrellas de fondo
    for(let estrella of estrellas) {
        estrella.y += estrella.velocidad;
        if(estrella.y > canvas.height) {
            estrella.y = 0;
            estrella.x = Math.random() * canvas.width;
        }
    }
    
    // Partículas
    for(let i = particulas.length - 1; i >= 0; i--) {
        let p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        if(p.vida <= 0) {
            particulas.splice(i, 1);
        }
    }
    
    // Sistema de combo
    if(tiempoCombo > 0) {
        tiempoCombo--;
        if(tiempoCombo <= 0) {
            comboActual = 0;
        }
    }
    
    // Sistema de invulnerabilidad
    if(JugadorStats.invulnerable) {
        JugadorStats.tiempoInvulnerable--;
        if(JugadorStats.tiempoInvulnerable <= 0) {
            JugadorStats.invulnerable = false;
        }
    }
    
    // Duración del power-up
    if(Jugador.duracionPowerUp > 0) {
        Jugador.duracionPowerUp--;
        if(Jugador.duracionPowerUp <= 0) {
            Jugador.tipoDisparo = 'normal';
        }
    }
    
    // Duración del escudo
    if(Jugador.tieneEscudo) {
        Jugador.duracionEscudo--;
        if(Jugador.duracionEscudo <= 0) {
            Jugador.tieneEscudo = false;
        }
    }
    
    // Sistema de dash
    if(Jugador.dashCooldown > 0) {
        Jugador.dashCooldown--;
        if(Jugador.dashCooldown <= 0) {
            Jugador.dashDisponible = true;
        }
    }
    
    if(Jugador.enDash) {
        Jugador.dashDuracion--;
        if(Jugador.dashDuracion <= 0) {
            Jugador.enDash = false;
        }
    }
    
    // Movimiento del jugador con dash
    let velocidadMov = Jugador.enDash ? Jugador.dashVelocidad : 6;
    
    if(teclas.Arriba && Jugador.y > 0) {
        Jugador.y -= velocidadMov;
        for(let i = 0; i < 2; i++) {
            particulas.push(crearParticula(Jugador.x + Jugador.ancho/2, Jugador.y + Jugador.alto, '#00aaff', 1));
        }
    }
    if(teclas.Abajo && Jugador.y < (canvas.height - Jugador.alto)) {
        Jugador.y += velocidadMov;
        for(let i = 0; i < 2; i++) {
            particulas.push(crearParticula(Jugador.x + Jugador.ancho/2, Jugador.y, '#00aaff', 1));
        }
    }
    if(teclas.Izquierda && Jugador.x > 0) {
        Jugador.x -= velocidadMov;
        for(let i = 0; i < 2; i++) {
            particulas.push(crearParticula(Jugador.x + Jugador.ancho, Jugador.y + Jugador.alto/2, '#00aaff', 1));
        }
    }
    if(teclas.Derecha && Jugador.x < canvas.width - Jugador.ancho) {
        Jugador.x += velocidadMov;
        for(let i = 0; i < 2; i++) {
            particulas.push(crearParticula(Jugador.x, Jugador.y + Jugador.alto/2, '#00aaff', 1));
        }
    }
    
    // Activar dash
    if(teclas.Shift && Jugador.dashDisponible && !Jugador.enDash) {
        Jugador.enDash = true;
        Jugador.dashDuracion = 10;
        Jugador.dashDisponible = false;
        Jugador.dashCooldown = 120; // 2 segundos
        JugadorStats.invulnerable = true;
        JugadorStats.tiempoInvulnerable = 10;
    }
    
    // Sistema de disparo continuo
    Jugador.tiempoUltimoDisparo++;
    if(teclas.Espacio && Jugador.tiempoUltimoDisparo >= Jugador.cooldownDisparo) {
        disparar();
        Jugador.tiempoUltimoDisparo = 0;
    }
    
    // --- ENEMIGOS ---
    if(enemigos.length === 0 && tiempoEntreOleadas === 0) {
        tiempoEntreOleadas = 120; // 2 segundos entre oleadas
    }
    
    if(tiempoEntreOleadas > 0) {
        tiempoEntreOleadas--;
        if(tiempoEntreOleadas === 0) {
            iniciarOleada();
        }
    }
    
    for(let enemigo of enemigos) {
        // Movimiento
        enemigo.x += enemigo.velocidadX * enemigo.direccion;
        
        if(enemigo.x <= 0 || enemigo.x >= canvas.width - enemigo.ancho) {
            enemigo.direccion *= -1;
        }
        
        // Disparo
        enemigo.tiempoUltimoDisparo++;
        if(enemigo.tiempoUltimoDisparo >= enemigo.intervaloDisparo) {
            balasEnemigas.push(crearBala(enemigo.x + enemigo.ancho/2 - 3, enemigo.y + enemigo.alto, 'enemigo'));
            enemigo.tiempoUltimoDisparo = 0;
        }
        
        // Animación
        enemigo.timerAnimacion++;
        if (enemigo.timerAnimacion > enemigo.velocidadAnimacion) {
            enemigo.frameActual++;
            if (enemigo.frameActual >= enemigo.totalFrames) {
                enemigo.frameActual = 0;
            }
            enemigo.timerAnimacion = 0;
        }
    }
    
    // --- BALAS DEL JUGADOR ---
    for(let i = balasJugador.length - 1; i >= 0; i--) {
        let bala = balasJugador[i];
        
        bala.trail.push({x: bala.x, y: bala.y});
        if(bala.trail.length > 5) bala.trail.shift();
        
        bala.rotacion += 0.2;
        
        if(bala.angulo !== 0) {
            bala.x += Math.sin(bala.angulo) * bala.velocidad;
            bala.y -= Math.cos(bala.angulo) * bala.velocidad;
        } else {
            bala.y -= bala.velocidad;
        }
        
        if (bala.y + bala.alto < 0 || bala.x < -50 || bala.x > canvas.width + 50) { 
            balasJugador.splice(i, 1);
            continue;
        }
        
        // Colisión con enemigos
        for(let j = enemigos.length - 1; j >= 0; j--) {
            let enemigo = enemigos[j];
            if(hayColision(bala, enemigo)) {
                enemigo.vida -= bala.daño;
                balasJugador.splice(i, 1);
                puntuacion += 10 * bala.daño;
                
                crearExplosion(bala.x, bala.y, 5);
                
                if(enemigo.vida <= 0) {
                    crearExplosion(enemigo.x + enemigo.ancho/2, enemigo.y + enemigo.alto/2, 30);
                    puntuacion += enemigo.puntos;
                    enemigosEliminados++;
                    
                    // Sistema de combo
                    comboActual++;
                    tiempoCombo = 180; // 3 segundos
                    
                    if(comboActual >= 10 && !logros.combo10) {
                        logros.combo10 = true;
                        mostrarLogro("¡COMBO x10!");
                    }
                    
                    // Drop de power-up
                    if(Math.random() < 0.3) {
                        powerUps.push(crearPowerUp(enemigo.x + enemigo.ancho/2, enemigo.y));
                    }
                    
                    enemigos.splice(j, 1);
                }
                break;
            }
        }
    }
    
    // --- POWER-UPS ---
    for(let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.y += powerUp.velocidad;
        powerUp.parpadeo++;
        powerUp.rotacion += 0.05;
        
        if(powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            continue;
        }
        
        if(hayColision(powerUp, Jugador)) {
            if(powerUp.tipo === 'vida') {
                JugadorStats.vida = Math.min(JugadorStats.vida + 1, JugadorStats.vidaMaxima);
            } else if(powerUp.tipo === 'escudo') {
                Jugador.tieneEscudo = true;
                Jugador.duracionEscudo = 300; // 5 segundos
            } else {
                Jugador.tipoDisparo = powerUp.tipo;
                Jugador.duracionPowerUp = 600;
            }
            powerUps.splice(i, 1);
        }
    }
    
    // --- BALAS ENEMIGAS ---
    for(let i = balasEnemigas.length - 1; i >= 0; i--) {
        let balaEnemiga = balasEnemigas[i];
        balaEnemiga.y += balaEnemiga.velocidad;
        
        if(balaEnemiga.y > canvas.height) {
            balasEnemigas.splice(i, 1);
            continue;
        }
        
        if(!JugadorStats.invulnerable && hayColision(balaEnemiga, Jugador)) {
            if(!Jugador.tieneEscudo) {
                JugadorStats.vida--;
                logros.sinDaño = false;
                JugadorStats.invulnerable = true;
                JugadorStats.tiempoInvulnerable = 60;
                crearExplosion(Jugador.x + Jugador.ancho/2, Jugador.y + Jugador.alto/2, 15);
                
                if(JugadorStats.vida <= 0) {
                    gameOver();
                }
            } else {
                Jugador.tieneEscudo = false;
            }
            balasEnemigas.splice(i, 1);
        }
    }

    // Animación Jugador
    Jugador.timerAnimacion++;
    if (Jugador.timerAnimacion > Jugador.velocidadAnimacion) {
        Jugador.frameActual++;
        if (Jugador.frameActual >= Jugador.totalFrames) {
            Jugador.frameActual = 0;
        }
        Jugador.timerAnimacion = 0;
    }
    
    // Nivel
    if(enemigosEliminados >= oleadaActual * 5) {
        nivel++;
        if(nivel === 5 && !logros.nivel5) {
            logros.nivel5 = true;
            mostrarLogro("¡NIVEL 5 ALCANZADO!");
        }
    }
}

// --- DIBUJAR ---
function dibujar(){
    // Fondo degradado
    let gradiente = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradiente.addColorStop(0, '#000428');
    gradiente.addColorStop(1, '#004e92');
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Estrellas
    ctx.fillStyle = '#ffffff';
    for(let estrella of estrellas) {
        ctx.globalAlpha = 0.8;
        ctx.fillRect(estrella.x, estrella.y, estrella.tamaño, estrella.tamaño);
    }
    ctx.globalAlpha = 1;
    
    // Partículas
    for(let p of particulas) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.vida / 30;
        ctx.fillRect(p.x, p.y, p.tamaño, p.tamaño);
    }
    ctx.globalAlpha = 1;
    
    // --- ENEMIGOS ---
    for(let enemigo of enemigos) {
        if(enemigo.anchoOriginalFrame > 0) {
            let recorteX = enemigo.frameActual * enemigo.anchoOriginalFrame;
            
            ctx.save();
            ctx.translate(enemigo.x + enemigo.ancho/2, enemigo.y + enemigo.alto/2);
            ctx.rotate(Math.PI);
            
            // Efecto de color según tipo
            if(enemigo.tipo === 'jefe') {
                ctx.shadowBlur = 20;
                ctx.shadowColor = enemigo.color;
            }
            
            ctx.drawImage(
                enemigo.sprite,
                recorteX, 0,
                enemigo.anchoOriginalFrame,
                enemigo.altoOriginalFrame,
                -enemigo.ancho/2, -enemigo.alto/2,
                enemigo.ancho, enemigo.alto
            );
            ctx.restore();
            ctx.shadowBlur = 0;
            
            // Barra de vida
            let barraAncho = enemigo.ancho;
            let vidaPorcentaje = enemigo.vida / enemigo.vidaMaxima;
            ctx.fillStyle = "#330000";
            ctx.fillRect(enemigo.x, enemigo.y - 10, barraAncho, 5);
            
            let colorVida = vidaPorcentaje > 0.5 ? "#00ff00" : vidaPorcentaje > 0.25 ? "#ffff00" : "#ff0000";
            ctx.fillStyle = colorVida;
            ctx.fillRect(enemigo.x, enemigo.y - 10, barraAncho * vidaPorcentaje, 5);
        }
    }
    
    // --- JUGADOR ---
    if (Jugador.anchoOriginalFrame > 0) {
        let dibujar = true;
        if(JugadorStats.invulnerable) {
            dibujar = Math.floor(framesTotales / 5) % 2 === 0;
        }
        
        if(dibujar) {
            let recorteX = Jugador.frameActual * Jugador.anchoOriginalFrame;
            
            // Escudo visual
            if(Jugador.tieneEscudo) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(Jugador.x + Jugador.ancho/2, Jugador.y + Jugador.alto/2, 50, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Efecto dash
            if(Jugador.enDash) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00aaff';
            }
            
            ctx.drawImage(
                Jugador.sprite,
                recorteX, 0,
                Jugador.anchoOriginalFrame,
                Jugador.altoOriginalFrame,
                Jugador.x, Jugador.y,
                Jugador.ancho, Jugador.alto
            );
            ctx.shadowBlur = 0;
        }
    }
    
    // --- BALAS ---
    for(let bala of balasJugador) {
        for(let i = 0; i < bala.trail.length; i++) {
            let alpha = (i / bala.trail.length) * 0.5;
            ctx.fillStyle = bala.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(bala.trail[i].x, bala.trail[i].y, bala.ancho, bala.alto);
        }
        
        ctx.fillStyle = bala.color;
        if(bala.tipo === 'laser' || bala.tipo === 'plasma') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = bala.color;
        }
        
        ctx.save();
        ctx.translate(bala.x + bala.ancho/2, bala.y + bala.alto/2);
        ctx.rotate(bala.rotacion);
        ctx.fillRect(-bala.ancho/2, -bala.alto/2, bala.ancho, bala.alto);
        ctx.restore();
        ctx.shadowBlur = 0;
    }
    
    // Balas enemigas
    for(let bala of balasEnemigas) {
        ctx.fillStyle = bala.color;
        ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
    }
    
    // --- POWER-UPS ---
    for(let powerUp of powerUps) {
        if(Math.floor(powerUp.parpadeo / 10) % 2 === 0) {
            const colores = {
                triple: '#00ffff',
                laser: '#ff00ff',
                spread: '#ff8800',
                plasma: '#00ff00',
                escudo: '#0088ff',
                vida: '#ff0088'
            };
            
            ctx.save();
            ctx.translate(powerUp.x + 15, powerUp.y + 15);
            ctx.rotate(powerUp.rotacion);
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = colores[powerUp.tipo];
            ctx.fillStyle = colores[powerUp.tipo];
            ctx.fillRect(-15, -15, 30, 30);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-15, -15, 30, 30);
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(powerUp.tipo[0].toUpperCase(), 0, 5);
            ctx.restore();
        }
    }
    
    // --- HUD ---
    // Barras de vida
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(5, canvas.height - 35, 200, 30);
    
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(10, canvas.height - 30, 190, 20);
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(10, canvas.height - 30, 190 * (JugadorStats.vida / JugadorStats.vidaMaxima), 20);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 30, 190, 20);
    
    // Texto HUD
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("💙 Vida: " + JugadorStats.vida, 15, canvas.height - 40);
    ctx.fillText("⭐ Puntos: " + puntuacion, 10, 25);
    ctx.fillText("🎯 Nivel: " + nivel, 10, 50);
    ctx.fillText("🔥 Oleada: " + oleadaActual, 10, 75);
    
    // Combo
    if(comboActual > 1) {
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = comboActual >= 10 ? "#ff00ff" : "#ffff00";
        ctx.textAlign = "center";
        ctx.fillText("COMBO x" + comboActual + "!", canvas.width / 2, 50);
    }
    
    // Dash cooldown
    if(!Jugador.dashDisponible) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(canvas.width - 110, canvas.height - 35, 100, 25);
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(canvas.width - 105, canvas.height - 30, 90, 15);
        ctx.fillStyle = "#00ff00";
        let dashProgress = 1 - (Jugador.dashCooldown / 120);
        ctx.fillRect(canvas.width - 105, canvas.height - 30, 90 * dashProgress, 15);
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("DASH", canvas.width - 60, canvas.height - 40);
    } else {
        ctx.fillStyle = "#00ff00";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("✓ DASH LISTO", canvas.width - 60, canvas.height - 20);
    }
    
    // Arma actual
    if(Jugador.tipoDisparo !== 'normal') {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(canvas.width - 200, 10, 190, 70);
        
        ctx.fillStyle = "#ffff00";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "left";
        ctx.fillText("🔫 " + Jugador.tipoDisparo.toUpperCase(), canvas.width - 190, 30);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText("Tiempo: " + Math.ceil(Jugador.duracionPowerUp / 60) + "s", canvas.width - 190, 50);
        
        // Barra de tiempo
        let tiempoProgress = Jugador.duracionPowerUp / 600;
        ctx.fillStyle = "#444";
        ctx.fillRect(canvas.width - 190, 60, 170, 10);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(canvas.width - 190, 60, 170 * tiempoProgress, 10);
    }
    
    // Escudo activo
    if(Jugador.tieneEscudo) {
        ctx.fillStyle = "#00ffff";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "right";
        ctx.fillText("🛡️ ESCUDO: " + Math.ceil(Jugador.duracionEscudo / 60) + "s", canvas.width - 10, 100);
    }
    
    // Mejor puntuación
    ctx.fillStyle = "#ffff00";
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Mejor: " + mejorPuntuacion, canvas.width - 10, 25);
    
    // Pantalla de inicio
    if(!juegoIniciado) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("SPACE BLASTER", canvas.width / 2, canvas.height / 2 - 100);
        
        ctx.font = "24px Arial";
        ctx.fillStyle = "#00ffff";
        ctx.fillText("Presiona ESPACIO para empezar", canvas.width / 2, canvas.height / 2);
        
        ctx.font = "18px Arial";
        ctx.fillStyle = "#ffff00";
        ctx.fillText("Controles:", canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("WASD / Flechas - Mover", canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillText("ESPACIO - Disparar", canvas.width / 2, canvas.height / 2 + 110);
        ctx.fillText("SHIFT - Dash (esquiva rápida)", canvas.width / 2, canvas.height / 2 + 140);
    }
}

function gameOver() {
    if(puntuacion > mejorPuntuacion) {
        mejorPuntuacion = puntuacion;
        localStorage.setItem('bestScore', mejorPuntuacion);
    }
    
    let mensaje = "¡GAME OVER!\n\n";
    mensaje += "Puntuación: " + puntuacion + "\n";
    mensaje += "Mejor: " + mejorPuntuacion + "\n";
    mensaje += "Nivel alcanzado: " + nivel + "\n";
    mensaje += "Oleadas completadas: " + oleadaActual;
    
    alert(mensaje);
    location.reload();
}

function mostrarLogro(texto) {
    console.log("🏆 LOGRO DESBLOQUEADO: " + texto);
}

function loop(){
    actualizar();
    dibujar();
    requestAnimationFrame(loop);
}

// --- INICIALIZACIÓN ---
let spritesJugadorCargado = false;
let spritesEnemigoCargado = false;

imagenSprite.onload = function() {
    Jugador.anchoOriginalFrame = this.width / Jugador.totalFrames;
    Jugador.altoOriginalFrame = this.height; 
    spritesJugadorCargado = true;
    
    if(spritesJugadorCargado && spritesEnemigoCargado) {
        loop();
    }
};

imagenEnemigoSprite.onload = function() {
    spritesEnemigoCargado = true;
    
    if(spritesJugadorCargado && spritesEnemigoCargado) {
        loop();
    }
};

imagenSprite.onerror = function() {
    console.error("Error al cargar sprite del jugador.");
};

imagenEnemigoSprite.onerror = function() {
    console.error("Error al cargar sprite del enemigo.");
};