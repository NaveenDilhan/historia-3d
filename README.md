# Historia 3D

A highly immersive, interactive 3D educational web environment that blends artistic lessons with game mechanics. Built with React, Three.js, and React Three Fiber, this project offers users a journey through different eras with an "ancient archive" aesthetic. It focuses on keyboard-driven exploration, AI-powered storytelling, and rich spatial audio.

## 🌟 Key Features

*   **Interactive 3D Game Mechanics**: Navigate through biome-specific eras using a dedicated keyboard-only control scheme, with customized scroll-locking to keep focus on the 3D globe and scene without visual clipping or transparency issues.
*   **AI-Powered Narration**: Integrates OpenAI and Groq for dynamic storytelling, featuring context-aware ambient facts that intelligently react to your progression (such as deactivating after specific events like the geothermal modal).
*   **Immersive Spatial Audio**: Features an integrated audio system with positional sound effects tailored to specific biomes, enhancing the atmosphere of each era.
*   **End-of-Era Assessments**: Tests user knowledge with integrated interactive quizzes containing 5 multiple-choice questions with 4 choices each at the conclusion of each historical era.
*   **Themed UI & Authentication**: A consistent "ancient/archive" visual theme across the platform, featuring custom dark brown assets, floating scroll logo animations, responsive login/registration pages, and beautifully styled profile and logout confirmation modals. 
*   **Smart Debugging**: Features a custom React Loading Screen with context-aware, asset-specific diagnostic hints for smooth troubleshooting during the initial heavy 3D asset loads.

## 🚀 User Guide

Want to run Historia 3D locally on your machine? Follow these steps to set up the development environment.

### Prerequisites
Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Git](https://git-scm.com/)
*   [MongoDB](https://www.mongodb.com/) (Local installation or a MongoDB Atlas URI)
*   API Keys for **OpenAI** and **ElevenLab** (required for the AI narration features)

### 1. Clone the Repository
Open your terminal and clone the repository using Git:

```bash
git clone [https://github.com/NaveenDilhan/historia-3d.git](https://github.com/NaveenDilhan/historia-3d.git)
cd historia-3d
```
### 2. Install Dependencies
Install the required packages for both the client and the server. (If your backend and frontend are in separate folders, run this in both directories).

```bash
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the root directory of your project and add your database connection string and API keys. Use the following template:

```env
# Database
MONGO_URI=your_mongodb_connection_string_here

# AI Integrations
OPENAI_API_KEY=your_openai_api_key_here
ELEVEN_API_KEY=your_groq_api_key_here

# Server Port (Optional)
PORT=5000
```

### 4. Run the Development Server
Once everything is installed and configured, start the Vite development server and your backend environment:

```bash
# Starts the Vite frontend server
npm run dev
```

The application should now be running locally. Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal) to explore the Historia!

## 🛠️ Tech Stack

**Frontend & Tooling**
*   [React](https://react.dev/)
*   [Vite](https://vitejs.dev/) (Build tool & development server)
*   [Tailwind CSS / Sass](https://sass-lang.com/) (For ancient/archive aesthetic styling)
*   Git & GitHub (Version control & CI/CD)

**3D Rendering & Animation**
*   [Three.js](https://threejs.org/) (Core 3D Engine)
*   [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) (React wrapper for Three.js)
*   [GSAP](https://gsap.com/) (For smooth floating animations and UI transitions)

**Backend & Integration**
*   MERN Stack Architecture (MongoDB, Express, React, Node.js)
*   OpenAI API & Groq API (For dynamic AI narration generation)

## 📂 Project Structure

```text
historia-3d/
├── public/                 # Static assets (Not processed by Vite)
│   ├── audio/              # Biome-specific positional audio and SFX
│   ├── models/             # Compressed .glb 3D models for different eras
│   └── media/              # Ancient/archive themed UI assets (e.g., scroll logos)
├── src/                    # Source code
│   ├── components/         # React components (LoadingScreen, ProfilePage, Quizzes)
│   ├── pages/              # Routing pages (Login, Register, Home)
│   ├── scene/              # React Three Fiber scenes, era configurations, and biomes
│   ├── utils/              # AI narration logic, event triggers, and audio managers
│   ├── App.jsx             # Core application state, routing, and render setup
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles and themed UI styling
├── index.html              # Main HTML entry
└── package.json            # Project dependencies and scripts
```

## 🙏 Credits & Acknowledgments

This project utilises several open-source libraries and incredible community assets. A huge thank you to the creators who made their work available.


**3D Models & Sound Design**

* ["Hollow Knight Fanart"](https://sketchfab.com/3d-models/hollow-knight-fanart-aee54b0967114f4699ba25a77d467eac) by [Guilherme Lé] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Pochita"](https://sketchfab.com/3d-models/pochita-91023b6e85b4463eacad786496c233a0) by [ARKON MAREK] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Stylized Speakers"](https://sketchfab.com/3d-models/stylized-speakers-ed6ba07891b948b8adca81e81b35c4be) by [Other.Dimension] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["3December 2021 Day 10: Cat"](https://sketchfab.com/3d-models/3december-2021-day-10-cat-3fe220696e194ee18c045e8ab3072510) by [Liberi Arcano] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Happy Lo-Fi (Lofi Collection)"](https://opengameart.org/content/happy-lo-fi-lofi-collection) by [Holizna] on OpenGameArt.Org - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

**Textures & Lighting (HDRI)**

* Texture Images sourced from [Poly Haven](https://polyhaven.com/) (CC0 License).

**Libraries & Tools**

* 3D rendering engine powered by [Three.js](https://threejs.org/) and [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/).

* UI components and icons provided by [Lucide React / Tailwind CSS].

## 📜 License

This project is licensed under the [MIT License](LICENSE.md) - see the LICENSE file for details.

