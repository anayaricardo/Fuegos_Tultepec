import { useEffect, useRef, useState } from "react";
import p5 from "p5";

// Componente principal que maneja la animación de fuegos artificiales
export default function Fireworks() {
  // Estado para mantener la instancia de p5.js
  const [instance, setInstance] = useState(null);
  // Referencia al contenedor del canvas
  const containerRef = useRef();

  useEffect(() => {
    // Variables globales para el sketch
    let fireworks = []; // Array para almacenar todos los fuegos artificiales activos
    let stars = []; // Array para almacenar las estrellas del fondo
    let gravity; // Vector de gravedad que afectará a las partículas

    // Clase para crear estrellas en el fondo
    class Star {
      constructor(p) {
        // Posición aleatoria en el cielo
        this.x = p.random(p.width);
        this.y = p.random(p.height * 0.7); // Solo en la parte superior
        this.size = p.random(0.1, 2); // Tamaño aleatorio
        this.twinkleSpeed = p.random(0.02, 0.05); // Velocidad de parpadeo
        this.angle = p.random(p.TWO_PI); // Ángulo inicial para el parpadeo
      }

      // Método para hacer que la estrella parpadee
      twinkle(p) {
        this.angle += this.twinkleSpeed;
        const brightness = p.map(p.sin(this.angle), -1, 1, 100, 255);
        p.fill(255, brightness);
        p.noStroke();
        p.ellipse(this.x, this.y, this.size);
      }
    }

    // Configuración inicial del sketch de p5.js
    const sketch = (p) => {
      // Clase para crear partículas individuales
      class Particle {
        constructor(x, y, hu, firework) {
          this.pos = p.createVector(x, y); // Posición inicial
          this.firework = firework; // Indica si es el cohete inicial o una partícula de explosión
          this.lifespan = 255; // Duración de la partícula
          this.hu = hu; // Color (tono)
          this.acc = p.createVector(0, 0); // Aceleración

          if (firework) {
            // Si es un cohete, sube en línea recta con velocidad aleatoria
            this.vel = p.createVector(0, p.random(-12, -8));
          } else {
            // Si es una partícula de explosión, dirección aleatoria
            this.vel = p5.Vector.random2D();
            this.vel.mult(p.random(2, 10)); // Velocidad aleatoria
          }
        }

        // Aplica una fuerza a la partícula (como la gravedad)
        applyForce(force) {
          this.acc.add(force);
        }

        // Actualiza la posición y estado de la partícula
        update() {
          if (!this.firework) {
            // Solo las partículas de explosión pierden vida
            this.lifespan -= 4;
          }
          // Física básica: v = v + a, p = p + v
          this.vel.add(this.acc);
          this.pos.add(this.vel);
          this.acc.mult(0); // Reinicia la aceleración
        }

        // Comprueba si la partícula debe ser eliminada
        done() {
          return this.lifespan < 0;
        }

        // Dibuja la partícula
        show() {
          p.colorMode(p.HSB);
          p.strokeWeight(this.firework ? 4 : 2); // Cohetes más grandes que partículas
          p.stroke(this.hu, 255, 255, this.firework ? 255 : this.lifespan);
          p.point(this.pos.x, this.pos.y);
        }
      }

      // Clase principal para manejar un fuego artificial completo
      class Firework {
        constructor(x = null) {
          this.hu = p.random(255); // Color aleatorio
          const startX = x || p.random(p.width); // Posición inicial
          this.firework = new Particle(startX, p.height, this.hu, true); // Crea el cohete
          this.exploded = false; // Estado de explosión
          this.particles = []; // Partículas de la explosión
        }

        // Comprueba si el fuego artificial ha terminado
        done() {
          return this.exploded && this.particles.length === 0;
        }

        // Actualiza el estado del fuego artificial
        update() {
          if (!this.exploded) {
            // Actualiza el cohete hasta que explota
            this.firework.applyForce(gravity);
            this.firework.update();

            // Explota cuando alcanza su altura máxima
            if (this.firework.vel.y >= 0) {
              this.exploded = true;
              this.explode();
            }
          }

          // Actualiza todas las partículas de la explosión
          for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();

            // Elimina partículas muertas
            if (this.particles[i].done()) {
              this.particles.splice(i, 1);
            }
          }
        }

        // Crea la explosión
        explode() {
          // Crea 100 partículas en la posición de explosión
          for (let i = 0; i < 100; i++) {
            const p = new Particle(
              this.firework.pos.x,
              this.firework.pos.y,
              this.hu,
              false
            );
            this.particles.push(p);
          }
        }

        // Dibuja el fuego artificial
        show() {
          if (!this.exploded) {
            this.firework.show(); // Muestra el cohete
          }

          // Muestra todas las partículas de la explosión
          for (let particle of this.particles) {
            particle.show();
          }
        }
      }

      // Configuración inicial de p5.js
      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.parent(containerRef.current);
        p.colorMode(p.HSB);
        gravity = p.createVector(0, 0.2); // Define la gravedad

        // Inicializar estrellas
        for (let i = 0; i < 300; i++) {
          // Aumentado el número de estrellas
          stars.push(new Star(p));
        }

        p.background(0);
        setInstance(p);
      };

      // Bucle principal de dibujo
      p.draw = () => {
        p.background(0, 0, 0, 25); // Fondo semi-transparente para efecto de estela

        // Dibujar estrellas primero para que estén en el fondo
        stars.forEach((star) => star.twinkle(p));

        // Crea fuegos artificiales automáticamente
        if (p.random(1) < 0.03) {
          fireworks.push(new Firework());
        }

        // Actualiza y muestra todos los fuegos artificiales
        for (let i = fireworks.length - 1; i >= 0; i--) {
          fireworks[i].update();
          fireworks[i].show();
          if (fireworks[i].done()) {
            fireworks.splice(i, 1);
          }
        }
      };

      // Manejo de clics del mouse
      p.mouseClicked = () => {
        if (p.mouseY > 100) {
          // Evita crear fuegos artificiales si se hace clic en el título
          fireworks.push(new Firework(p.mouseX));
        }
        return false; // Previene comportamiento por defecto
      };

      // Manejo del redimensionamiento de la ventana
      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        // Reajustar las estrellas cuando cambia el tamaño de la ventana
        stars = [];
        for (let i = 0; i < 300; i++) {
          stars.push(new Star(p));
        }
      };
    };

    // Limpia el canvas anterior si existe
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    // Crea una nueva instancia de p5
    const p5Instance = new p5(sketch);

    // Limpieza al desmontar el componente
    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
      setInstance(null);
      fireworks = [];
      stars = [];
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  // Render del componente
  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        touchAction: "none", // Previene comportamientos táctiles por defecto
        zIndex: 1, // Asegura que el canvas esté detrás del título
      }}
    />
  );
}
