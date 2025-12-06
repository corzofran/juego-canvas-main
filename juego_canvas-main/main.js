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

// --- 1. CARGA DEL SPRITE SHEET ---
const imagenSprite = new Image();
imagenSprite.src = './assets/spaceship/space-ship_spritesheet.png'; 

// --- SPRITE DEL ENEMIGO ---
const imagenEnemigoSprite = new Image();
imagenEnemigoSprite.src = './assets/spaceship/space-ship_spritesheet.png';

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
    velocidadAnimacion: 10,
    
    // SISTEMA DE DISPARO
    tipoDisparo: 'normal', // normal, triple, laser, spread, missile
    tiempoUltimoDisparo: 0,
    cooldownDisparo: 10, // Frames entre disparos
    duracionPowerUp: 0
}

// --- ENEMIGO ---
const Enemigo = {
    x: canvas.width / 2 - 40,
    y: 50,
    ancho: 80,
    alto: 80,
    
    sprite: imagenEnemigoSprite,
    totalFrames: 8,
    frameActual: 0,
    
    anchoOriginalFrame: 0,
    altoOriginalFrame: 0,
    
    timerAnimacion: 0,
    velocidadAnimacion: 4,
    
    vida: 10,
    vidaMaxima: 10,
    
    velocidadX: 4,
    direccion: 1,
    
    tiempoUltimoDisparo: 0,
    intervaloDisparo: 60
}

let balasJugador = []; // Ahora usamos un array para múltiples balas
let balasEnemigas = [];
let powerUps = []; // Power-ups que caen

// --- SISTEMA DE JUGADOR ---
const JugadorStats = {
    vida: 3,
    vidaMaxima: 3,
    invulnerable: false,
    tiempoInvulnerable: 0
}

// --- SISTEMA DE DIFICULTAD PROGRESIVA ---
let puntuacion = 0;
let nivel = 1;
let framesTotales = 0;

// --- TIPOS DE BALAS ---
function crearBala(x, y, tipo = 'normal', angulo = 0) {
    const balas = {
        normal: { color: "#ffff00", ancho: 6, alto: 18, velocidad: 12, daño: 1 },
        triple: { color: "#00ffff", ancho: 5, alto: 15, velocidad: 12, daño: 1 },
        laser: { color: "#ff00ff", ancho: 8, alto: 30, velocidad: 15, daño: 2 },
        spread: { color: "#ff8800", ancho: 8, alto: 12, velocidad: 10, daño: 1 },
        missile: { color: "#ff0000", ancho: 10, alto: 20, velocidad: 8, daño: 3 },
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
        trail: [] // Estela para efecto visual
    };
}

// --- POWER-UPS ---
function crearPowerUp(x, y) {
    const tipos = ['triple', 'laser', 'spread', 'missile'];
    const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
    
    return {
        x: x,
        y: y,
        ancho: 30,
        alto: 30,
        tipo: tipoAleatorio,
        velocidad: 2,
        activo: true,
        parpadeo: 0
    };
}

// --- CONTROLES ---
const teclas = { Arriba: false, Abajo: false, Izquierda: false, Derecha: false, Espacio: false }

window.addEventListener('keydown', (e) => { 
    if(e.code === "Space") { 
        e.preventDefault(); 
        teclas.Espacio = true;
    } else moveOrStop(e.key, true) 
});

window.addEventListener('keyup', (e) => { 
    if(e.code === "Space") {
        teclas.Espacio = false;
    } else moveOrStop(e.key, false) 
});

function moveOrStop(key, move){ 
    switch(key) { 
        case 'ArrowUp': case 'w': case 'W': teclas.Arriba = move; break; 
        case 'ArrowDown': case 's': case 'S': teclas.Abajo = move; break; 
        case 'ArrowLeft': case 'a': case 'A': teclas.Izquierda = move; break; 
        case 'ArrowRight': case 'd': case 'D': teclas.Derecha = move; break; 
    }
}

// --- SISTEMA DE DISPARO MEJORADO ---
function disparar() {
    const centroX = Jugador.x + (Jugador.ancho / 2);
    const centroY = Jugador.y;
    
    switch(Jugador.tipoDisparo) {
        case 'normal':
            balasJugador.push(crearBala(centroX - 3, centroY, 'normal'));
            break;
            
        case 'triple':
            // Disparo central
            balasJugador.push(crearBala(centroX - 3, centroY, 'triple', 0));
            // Disparo izquierdo (ángulo -15 grados)
            balasJugador.push(crearBala(centroX - 20, centroY, 'triple', -0.3));
            // Disparo derecho (ángulo +15 grados)
            balasJugador.push(crearBala(centroX + 14, centroY, 'triple', 0.3));
            break;
            
        case 'laser':
            // Láser potente del centro
            balasJugador.push(crearBala(centroX - 4, centroY - 10, 'laser'));
            break;
            
        case 'spread':
            // Disparo en abanico (5 direcciones)
            for(let i = -2; i <= 2; i++) {
                let angulo = i * 0.4; // Ángulos: -0.8, -0.4, 0, 0.4, 0.8
                balasJugador.push(crearBala(centroX - 4, centroY, 'spread', angulo));
            }
            break;
            
        case 'missile':
            // Misiles teledirigidos (2)
            balasJugador.push(crearBala(centroX - 25, centroY, 'missile'));
            balasJugador.push(crearBala(centroX + 15, centroY, 'missile'));
            break;
    }
}

// --- DISPARO DEL ENEMIGO ---
function enemigoDispara() {
    if(nivel >= 3) {
        balasEnemigas.push(crearBala(Enemigo.x + (Enemigo.ancho/2) - 3, Enemigo.y + Enemigo.alto, 'enemigo'));
        balasEnemigas.push(crearBala(Enemigo.x + 10, Enemigo.y + Enemigo.alto, 'enemigo'));
        balasEnemigas.push(crearBala(Enemigo.x + Enemigo.ancho - 16, Enemigo.y + Enemigo.alto, 'enemigo'));
    } else {
        balasEnemigas.push(crearBala(Enemigo.x + (Enemigo.ancho/2) - 3, Enemigo.y + Enemigo.alto, 'enemigo'));
    }
}

// --- COLISIONES ---
function hayColision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.ancho &&
           obj1.x + obj1.ancho > obj2.x &&
           obj1.y < obj2.y + obj2.alto &&
           obj1.y + obj1.alto > obj2.y;
}

function actualizar() {
    framesTotales++;
    
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
            console.log("Power-up terminado");
        }
    }
    
    // Movimiento Jugador
    if(teclas.Arriba && Jugador.y > 0) Jugador.y -= 5
    if(teclas.Abajo && Jugador.y < (canvas.height - Jugador.alto)) Jugador.y += 5
    if(teclas.Izquierda && Jugador.x > 0) Jugador.x -=5
    if(teclas.Derecha && Jugador.x < canvas.width - Jugador.ancho) Jugador.x +=5
    
    // Sistema de disparo continuo
    Jugador.tiempoUltimoDisparo++;
    if(teclas.Espacio && Jugador.tiempoUltimoDisparo >= Jugador.cooldownDisparo) {
        disparar();
        Jugador.tiempoUltimoDisparo = 0;
    }
    
    // --- MOVIMIENTO DEL ENEMIGO ---
    if(Enemigo.vida > 0) {
        let velocidadActual = Enemigo.velocidadX + (nivel * 0.5);
        Enemigo.x += velocidadActual * Enemigo.direccion;
        
        if(Enemigo.x <= 0 || Enemigo.x >= canvas.width - Enemigo.ancho) {
            Enemigo.direccion *= -1;
        }
        
        Enemigo.tiempoUltimoDisparo++;
        let intervaloActual = Math.max(30, Enemigo.intervaloDisparo - (nivel * 5));
        if(Enemigo.tiempoUltimoDisparo >= intervaloActual) {
            enemigoDispara();
            Enemigo.tiempoUltimoDisparo = 0;
        }
    }
    
    // --- ACTUALIZAR BALAS DEL JUGADOR ---
    for(let i = balasJugador.length - 1; i >= 0; i--) {
        let bala = balasJugador[i];
        
        // Guardar posición anterior para la estela
        bala.trail.push({x: bala.x, y: bala.y});
        if(bala.trail.length > 5) bala.trail.shift();
        
        // Movimiento según ángulo
        if(bala.angulo !== 0) {
            bala.x += Math.sin(bala.angulo) * bala.velocidad;
            bala.y -= Math.cos(bala.angulo) * bala.velocidad;
        } else {
            bala.y -= bala.velocidad;
        }
        
        // Misiles teledirigidos
        if(bala.tipo === 'missile' && Enemigo.vida > 0) {
            let centroEnemigoX = Enemigo.x + Enemigo.ancho / 2;
            let dx = centroEnemigoX - bala.x;
            let distancia = Math.abs(dx);
            
            if(distancia > 5) {
                bala.x += dx > 0 ? 2 : -2;
            }
        }
        
        // Eliminar si sale de pantalla
        if (bala.y + bala.alto < 0 || bala.x < -50 || bala.x > canvas.width + 50) { 
            balasJugador.splice(i, 1);
            continue;
        }
        
        // Colisión con enemigo
        if(Enemigo.vida > 0 && hayColision(bala, Enemigo)) {
            Enemigo.vida -= bala.daño;
            balasJugador.splice(i, 1);
            puntuacion += 10 * bala.daño;
            
            if(Enemigo.vida <= 0) {
                console.log("¡Enemigo destruido!");
                puntuacion += 100;
                nivel++;
                
                // Chance de soltar power-up (50%)
                if(Math.random() < 0.5) {
                    powerUps.push(crearPowerUp(Enemigo.x + Enemigo.ancho/2, Enemigo.y));
                }
                
                setTimeout(() => {
                    Enemigo.vida = Enemigo.vidaMaxima + (nivel * 2);
                    Enemigo.vidaMaxima = Enemigo.vida;
                    Enemigo.x = canvas.width / 2 - 40;
                    console.log("¡NIVEL " + nivel + "! Enemigo más fuerte");
                }, 1000);
            }
        }
    }
    
    // --- ACTUALIZAR POWER-UPS ---
    for(let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.y += powerUp.velocidad;
        powerUp.parpadeo++;
        
        // Eliminar si sale de pantalla
        if(powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            continue;
        }
        
        // Colisión con jugador
        if(hayColision(powerUp, Jugador)) {
            Jugador.tipoDisparo = powerUp.tipo;
            Jugador.duracionPowerUp = 600; // 10 segundos
            powerUps.splice(i, 1);
            console.log("¡Power-up obtenido: " + powerUp.tipo + "!");
        }
    }
    
    // --- BALAS DEL ENEMIGO ---
    for(let i = balasEnemigas.length - 1; i >= 0; i--) {
        let balaEnemiga = balasEnemigas[i];
        balaEnemiga.y += balaEnemiga.velocidad;
        
        if(balaEnemiga.y > canvas.height) {
            balasEnemigas.splice(i, 1);
            continue;
        }
        
        if(!JugadorStats.invulnerable && hayColision(balaEnemiga, Jugador)) {
            JugadorStats.vida--;
            balasEnemigas.splice(i, 1);
            JugadorStats.invulnerable = true;
            JugadorStats.tiempoInvulnerable = 60;
            
            if(JugadorStats.vida <= 0) {
                alert("¡GAME OVER! Puntuación: " + puntuacion + " - Nivel: " + nivel);
                location.reload();
            }
        }
    }

    // Animaciones
    Jugador.timerAnimacion++;
    if (Jugador.timerAnimacion > Jugador.velocidadAnimacion) {
        Jugador.frameActual++;
        if (Jugador.frameActual >= Jugador.totalFrames) {
            Jugador.frameActual = 0;
        }
        Jugador.timerAnimacion = 0;
    }
    
    if(Enemigo.vida > 0) {
        Enemigo.timerAnimacion++;
        if (Enemigo.timerAnimacion > Enemigo.velocidadAnimacion) {
            Enemigo.frameActual++;
            if (Enemigo.frameActual >= Enemigo.totalFrames) {
                Enemigo.frameActual = 0;
            }
            Enemigo.timerAnimacion = 0;
        }
    }
}

function dibujar(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // --- DIBUJAR ENEMIGO ---
    if(Enemigo.vida > 0 && Enemigo.anchoOriginalFrame > 0) {
        let recorteX = Enemigo.frameActual * Enemigo.anchoOriginalFrame;
        let recorteY = 0;
        
        ctx.save();
        ctx.translate(Enemigo.x + Enemigo.ancho/2, Enemigo.y + Enemigo.alto/2);
        ctx.rotate(Math.PI);
        ctx.drawImage(
            Enemigo.sprite,
            recorteX, recorteY,
            Enemigo.anchoOriginalFrame,
            Enemigo.altoOriginalFrame,
            -Enemigo.ancho/2, -Enemigo.alto/2,
            Enemigo.ancho, Enemigo.alto
        );
        ctx.restore();
        
        // Barra de vida
        let barraAncho = Enemigo.ancho;
        let vidaPorcentaje = Enemigo.vida / Enemigo.vidaMaxima;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(Enemigo.x, Enemigo.y - 10, barraAncho, 5);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(Enemigo.x, Enemigo.y - 10, barraAncho * vidaPorcentaje, 5);
    }
    
    // --- DIBUJAR JUGADOR ---
    if (Jugador.anchoOriginalFrame > 0) {
        let dibujar = true;
        if(JugadorStats.invulnerable) {
            dibujar = Math.floor(framesTotales / 5) % 2 === 0;
        }
        
        if(dibujar) {
            let recorteX = Jugador.frameActual * Jugador.anchoOriginalFrame;
            ctx.drawImage(
                Jugador.sprite,
                recorteX, 0,
                Jugador.anchoOriginalFrame,
                Jugador.altoOriginalFrame,
                Jugador.x, Jugador.y,
                Jugador.ancho, Jugador.alto
            );
        }
        
        // Barra de vida del jugador
        let barraX = 10;
        let barraY = canvas.height - 30;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(barraX, barraY, 100, 15);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(barraX, barraY, 100 * (JugadorStats.vida / JugadorStats.vidaMaxima), 15);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(barraX, barraY, 100, 15);
    }
    
    // --- DIBUJAR BALAS DEL JUGADOR CON EFECTOS ---
    for(let bala of balasJugador) {
        // Estela
        for(let i = 0; i < bala.trail.length; i++) {
            let alpha = (i / bala.trail.length) * 0.5;
            ctx.fillStyle = bala.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(bala.trail[i].x, bala.trail[i].y, bala.ancho, bala.alto);
        }
        
        // Bala principal
        ctx.fillStyle = bala.color;
        
        if(bala.tipo === 'laser') {
            // Efecto de brillo para láser
            ctx.shadowBlur = 15;
            ctx.shadowColor = bala.color;
        }
        
        ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
        ctx.shadowBlur = 0;
    }
    
    // --- DIBUJAR BALAS ENEMIGAS ---
    ctx.fillStyle = "#ff0000";
    for(let balaEnemiga of balasEnemigas) {
        ctx.fillRect(balaEnemiga.x, balaEnemiga.y, balaEnemiga.ancho, balaEnemiga.alto);
    }
    
    // --- DIBUJAR POWER-UPS ---
    for(let powerUp of powerUps) {
        if(Math.floor(powerUp.parpadeo / 10) % 2 === 0) {
            // Color según tipo
            const colores = {
                triple: '#00ffff',
                laser: '#ff00ff',
                spread: '#ff8800',
                missile: '#ff0000'
            };
            
            ctx.fillStyle = colores[powerUp.tipo];
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.ancho, powerUp.alto);
            
            // Borde
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(powerUp.x, powerUp.y, powerUp.ancho, powerUp.alto);
            
            // Letra indicadora
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(powerUp.tipo[0].toUpperCase(), powerUp.x + 15, powerUp.y + 20);
        }
    }
    
    // --- INFORMACIÓN EN PANTALLA ---
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Vida Enemigo: " + Enemigo.vida, 10, 30);
    ctx.fillText("Nivel: " + nivel, 10, 55);
    ctx.fillText("Puntuación: " + puntuacion, 10, 80);
    ctx.fillText("Vida: " + JugadorStats.vida, canvas.width - 180, 30);
    
    // Mostrar tipo de disparo activo
    if(Jugador.tipoDisparo !== 'normal') {
        ctx.fillStyle = "#ffff00";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Arma: " + Jugador.tipoDisparo.toUpperCase(), canvas.width - 180, 55);
        ctx.fillText("Tiempo: " + Math.ceil(Jugador.duracionPowerUp / 60) + "s", canvas.width - 180, 75);
    }
}

function loop(){
    actualizar();
    dibujar();
    requestAnimationFrame(loop)
}

// --- INICIALIZACIÓN ---
console.log("Cargando Sprite Sheet...");

let spritesJugadorCargado = false;
let spritesEnemigoCargado = false;

imagenSprite.onload = function() {
    console.log("¡Sprite del Jugador cargado!");
    Jugador.anchoOriginalFrame = this.width / Jugador.totalFrames;
    Jugador.altoOriginalFrame = this.height; 
    spritesJugadorCargado = true;
    
    if(spritesJugadorCargado && spritesEnemigoCargado) {
        loop();
    }
};

imagenEnemigoSprite.onload = function() {
    console.log("¡Sprite del Enemigo cargado!");
    Enemigo.anchoOriginalFrame = this.width / Enemigo.totalFrames;
    Enemigo.altoOriginalFrame = this.height;
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