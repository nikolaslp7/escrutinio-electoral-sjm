# 🗳️ Sistema PWA de Escrutinio Electoral y Control de Personería de Mesa (SJM)
### *Elecciones Municipales • San Juan de Miraflores (Mesa N° 054990) • Alianza para el Progreso (APP)*

[![Next.js](https://img.shields.io/badge/Next.js-15%2B_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4_Theme-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-Persistent_Store-4338ca?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Physics_Animation-f43f5e?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthesized_FX-10b981?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![jsPDF](https://img.shields.io/badge/jsPDF-A4_Official_Tally-e11d48?style=for-the-badge)](https://github.com/parallax/jsPDF)

---

## 📌 Descripción del Proyecto

Aplicación Web Progresiva (**PWA**), responsiva (**Mobile-First**) y con arquitectura de grado producción diseñada para personeros de mesa electoral del partido político **Alianza para el Progreso (APP)** durante el escrutinio de votos en el distrito de **San Juan de Miraflores (SJM)**, Lima, Perú.

Permite a los personeros registrar cédula por cédula, corregir errores de conteo al instante con historial reversible (**Undo/Redo** con atajo `Ctrl+Z`), auditar el cuadre matemático de la mesa en tiempo real frente al padrón oficial, generar el documento oficial en formato **PDF A4** idéntico al acta formal del organismo electoral y despacharlo por **WhatsApp** mediante la **Web Share API Nivel 2**.

---

## 🚀 Arquitectura y Puntos Técnicos Destacados

### 1. Reordenamiento Físico Dinámico (Framer Motion)
- **Animaciones fluidas con `layout` y resortes físicos:**
  ```tsx
  <motion.div
    layout
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    key={candidate.id}
  >
    {/* Tarjeta de candidato */}
  </motion.div>
  ```
  Las tarjetas se reorganizan suavemente de mayor a menor votación sin saltos bruscos ni parpadeos (Flicker-Free).
- **Partículas Flotantes (Floating Badges):**
  - Al pulsar `+1` o `+5`, una etiqueta verde/cian asciende ~25px con desvanecimiento (`opacity: [1, 0]`, `y: [0, -25]`).
  - Al pulsar `-1`, un indicador rojo desciende con desvanecimiento.
  - Al pulsar `Pasar a Nulo`, se emite una insignia direccional `→ Nulo`.

### 2. Motor de Sonido y Hápticos Sin Dependencias Externas (Web Audio API)
- **Cero archivos MP3/WAV pesados ni peticiones de red:** Síntesis sonora procedural en tiempo real mediante `AudioContext` y ondas sinusoidales/triangulares con decaimiento exponencial (`exponentialRampToValueAtTime`):
  - **Voto +1:** Ping digital resonante de alta frecuencia (587Hz → 880Hz).
  - **Voto +5:** Arpegio mayor rápido y dinámico (C5 → E5 → G5).
  - **Voto -1:** Clic sordo de tono grave (330Hz → 196Hz).
  - **Pasar a Nulo:** Intervalo de advertencia en tono menor (440Hz → 370Hz).
  - **Deshacer (Undo):** Barrido de frecuencia inverso (220Hz → 587Hz).
  - **Victoria APP (#1):** Fanfarria triunfal mayor para el candidato Dante Mendieta.
  - **Mesa Cuadrada:** Acorde limpio de verificación.
- **Respuesta Háptica (`navigator.vibrate`):** Patrones de vibración háptica calibrados para dispositivos Android e iOS.
- **Control Mute/Unmute:** Alternancia inmediata con persistencia y tecla de acceso rápido.

### 3. Lógica Electoral: "Restar Voto" vs. "Pasar a Nulo"
- **`-1` (Corrección de Digitador):** Corrige errores involuntarios de pantalla táctil descontando 1 voto únicamente al candidato sin afectar los demás rubros.
- **`Pasar a Nulo` (Cédula Observada/Viciada):** Descuenta 1 voto del candidato y suma simultáneamente 1 voto a la casilla de **Votos Nulos**, preservando el total absoluto de cédulas escrutadas (227 votos) y evitando descuadres de mesa.
- **Sistema de Deshacer Completo (Undo / Redo):** Pila de estados inmutables persistidos con atajo global `Ctrl+Z` / `Cmd+Z` y `Ctrl+Y`.

### 4. Módulo Hero Destacado: Dante Mendieta (APP)
- Tarjeta fija en la parte superior con identidad corporativa de Alianza para el Progreso.
- Cálculo en tiempo real de:
  - **Posición Ordinal:** Puesto #2 actual; si supera a Edgar Mejía, se transforma con corona dorada 👑 (`PUESTO #1 • LÍDER DE MESA`) y activa confeti conmemorativo.
  - **% Votos Emitidos:** `39 / 227 = 17.2%`.
  - **% Votos Válidos:** `39 / 193 = 20.2%` (excluyendo votos nulos, blancos e impugnados).
  - **Diferencia contra el líder:** Brecha exacta de votos para alcanzar el primer lugar.
  - **Botones táctiles:** `+1`, `+5`, `-1`, `Pasar a Nulo` e interacción rápida al tocar el contador central.

### 5. Generador de Acta Oficial en PDF A4 (`jspdf` + `jspdf-autotable`)
Renderizado en el cliente de un documento formal A4 listo para auditoría e impresión:
- **Encabezado Institucional:** Insignia estilizada de APP, título de Acta Oficial de Escrutinio y mención al distrito de San Juan de Miraflores.
- **Metadatos de la Mesa:** Mesa 054990, Padrón (300 electores), Votantes (227 / 75.67%), Ausentismo (73 / 24.33%).
- **Banner de Cuadre:** Recuadro verde `"MESA CUADRADA EXACTA (227 de 227 votos emitidos)"`.
- **Panel Especial APP:** Ficha consolidada del candidato Dante Mendieta.
- **Tabla General Completa:** Los 17 rubros con ordenamiento descendente, columnas de votos, porcentajes emitidos y porcentajes válidos, con fila de cierre contable.
- **Cadena de Custodia Digital:** Hash criptográfico **SHA-256** determinístico calculado sobre la matriz de votos, fecha/hora y leyenda de amparo en la Ley Orgánica de Elecciones N° 26859.

### 6. Compartir Nativo por WhatsApp (Web Share API Nivel 2)
- Compila el PDF en memoria como un `Blob` y lo empaqueta como `File`.
- En teléfonos celulares (Android / iOS): Invoca `navigator.share({ files: [file] })` abriendo la hoja nativa para remitirlo directamente a WhatsApp o grupos partidarios.
- En navegadores de escritorio: Descarga el archivo PDF y abre automáticamente WhatsApp Web con el resumen textual formateado con emojis institucionales y totales de mesa.

---

## 📊 Estado Precargado de Demostración (Seed Data)

- **Distrito:** San Juan de Miraflores (SJM)
- **Mesa de Votación N°:** 054990
- **Total Padrón:** 300 cédulas
- **Votaron:** 227 (75.67% de participación)
- **Ausentes:** 73 (24.33% de ausentismo)
- **Candidato Principal APP:** Dante Mendieta (Alianza para el Progreso)

### Cuadro de Votación Oficial Inicial (17 Rubros):
| N° | Organización Política / Rubro | Candidato | Color Oficial | Votos | % Emitidos | % Válidos |
|:--:|:------------------------------|:----------|:-------------:|:-----:|:----------:|:---------:|
| 1 | Frente de la Esperanza | Edgar Mejía Rodríguez | `#009640` | **56** | 24.67% | 29.02% |
| 2 | **Alianza para el Progreso (APP)** | **Dante Mendieta** | `#003399` | **39** | **17.18%** | **20.21%** |
| 3 | Renovación Popular | Mabel Karina Leandro | `#009EE0` | **36** | 15.86% | 18.65% |
| 4 | *Votos Nulos / Viciados* | Acta Oficial | `#EF4444` | **23** | 10.13% | - |
| 5 | Somos Perú | Eloy Chávez Hernández | `#E30613` | **21** | 9.25% | 10.88% |
| 6 | Podemos Perú | Martín Palomino | `#D9251D` | **14** | 6.17% | 7.25% |
| 7 | Fuerza Popular | Anatoly Bedriñana | `#FF6600` | **11** | 4.85% | 5.70% |
| 8 | *Votos en Blanco* | Acta Oficial | `#94A3B8` | **11** | 4.85% | - |
| 9 | FREPAP | Jessica Alcántara | `#107C41` | **8** | 3.52% | 4.15% |
| 10 | Ahora Nación | Olis Yaranga Jacinto | `#EA580C` | **3** | 1.32% | 1.55% |
| 11 | Acción Popular | Alex Fabio Trujillo | `#DC2626` | **2** | 0.88% | 1.04% |
| 12 | PRIN | Edilberto Quispe | `#C2410C` | **2** | 0.88% | 1.04% |
| 13 | Partido Morado | Alan Freddy Mendoza | `#7E22CE` | **1** | 0.44% | 0.52% |
| 14 | PPC | Oswaldo Taype | `#15803D` | **0** | 0.00% | 0.00% |
| 15 | Perú Primero | Michel Sanabria | `#BE123C` | **0** | 0.00% | 0.00% |
| 16 | Avanza País | Homero Díaz Delgado | `#0284C7` | **0** | 0.00% | 0.00% |
| 17 | *Votos Impugnados* | Acta Oficial | `#F59E0B` | **0** | 0.00% | - |

> **Cuadre Matemático Exacto:**  
> $\sum \text{Votos Emitidos} = 56 + 39 + 36 + 23 + 21 + 14 + 11 + 11 + 8 + 3 + 2 + 2 + 1 + 0 + 0 + 0 + 0 = 227$ (100.0%)  
> $\text{Votos Válidos} = 227 - (23_{\text{nulos}} + 11_{\text{blancos}} + 0_{\text{impugnados}}) = 193$ votos válidos.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 15+ (App Router)
- **Lenguaje:** TypeScript (Strict Mode)
- **Estilos y Sistema de Diseño:** Tailwind CSS (con tokens Navy/Slate 950 `#0B0F19`, Azul APP `#003399`, Rojo Institucional `#E51C24`)
- **Estado Global:** Zustand con middleware `persist` en `localStorage`
- **Animaciones:** Framer Motion (físicas de reordenamiento con `layout`, resortes y partículas)
- **Generación Documental:** jsPDF & jspdf-autotable (formato oficial de Acta Electoral A4)
- **Audio y Háptica:** Web Audio API (`AudioContext`) y Web Vibration API
- **Iconografía:** Lucide React
- **PWA:** Manifest Web App, Mobile Touch Action `manipulation`, Viewport Lock, Standalone Mode

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/escrutinio-app-sjm.git
   cd escrutinio-app-sjm
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📱 Demostración en Dispositivos Móviles (PWA)

La aplicación fue concebida con enfoque **Mobile-First**:
- Prevención de zoom involuntario con doble toque (`touch-action: manipulation`).
- Botones de votación con objetivos táctiles ergonómicos (>44px).
- Instalable en pantalla de inicio de Android e iOS mediante Safari / Chrome ("Agregar a pantalla de inicio").

---

## 🛡️ Licencia y Reconocimientos
Desarrollado para fines de demostración tecnológica de portafolio y control electoral partidario.  
Alianza para el Progreso (APP) • San Juan de Miraflores, Lima, Perú.
