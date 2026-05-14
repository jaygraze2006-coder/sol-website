"use client";

import { useEffect, useRef, useState } from "react";

const folders = [
  { name: "Art", icon: "🎨" },
  { name: "Music", icon: "💿" },
  { name: "Apps", icon: "💻" },
  { name: "Photos", icon: "📷" },
];

const mazePath = new Set([
  "0,0",
  "1,0",
  "2,0",
  "2,1",
  "2,2",
  "3,2",
  "4,2",
  "2,3",
  "3,3",
  "4,3",
  "2,4",
  "3,4",
  "4,4",
  "5,4",
  "5,5",
]);

type TvStep = "password" | "menu" | "movies";

type PuzzlePosition = {
  x: number;
  y: number;
};

export default function Home() {
  const [landingOpen, setLandingOpen] = useState(true);
  const [earlyPassword, setEarlyPassword] = useState("");
  const [earlyPasswordError, setEarlyPasswordError] = useState(false);

  const [desktopOpen, setDesktopOpen] = useState(false);
  const [carOpen, setCarOpen] = useState(false);
  const [carInteriorOpen, setCarInteriorOpen] = useState(false);
  const [mapsOpen, setMapsOpen] = useState(false);
  const [radioOpen, setRadioOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);

  const songs = [
    "/music/song1.mp3",
    "/music/song2.mp3",
    "/music/song3.mp3",
    "/music/song4.mp3",
  ];

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<"hfc" | "umich">("hfc");
  const [pcPuzzleOpen, setPcPuzzleOpen] = useState(false);
  const [puzzlePos, setPuzzlePos] = useState<PuzzlePosition>({ x: 0, y: 0 });

  const [tvOpen, setTvOpen] = useState(false);
  const [tvStep, setTvStep] = useState<TvStep>("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const audioRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);

  function startStaticSound() {
    try {
      if (noiseRef.current) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioRef.current = audioContext;

      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i += 1) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioContext.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 800;

      const gain = audioContext.createGain();
      gain.gain.value = 0.035;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      whiteNoise.start(0);
      noiseRef.current = whiteNoise;
    } catch {
      // Browser blocked audio or unsupported. Site still works.
    }
  }

  function stopStaticSound() {
    try {
      noiseRef.current?.stop();
      noiseRef.current = null;
      audioRef.current?.close();
      audioRef.current = null;
    } catch {
      noiseRef.current = null;
      audioRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopStaticSound();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!pcPuzzleOpen) return;

      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") movePuzzle(0, -1);
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") movePuzzle(0, 1);
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") movePuzzle(-1, 0);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") movePuzzle(1, 0);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pcPuzzleOpen]);

  function checkEarlyPassword() {
    if (earlyPassword.trim().toLowerCase() === "phase 1") {
      setEarlyPasswordError(false);
      setLandingOpen(false);
      setEarlyPassword("");
    } else {
      setEarlyPasswordError(true);
    }
  }

  function openPcPuzzle() {
    setPuzzlePos({ x: 0, y: 0 });
    setPcPuzzleOpen(true);
  }

  function openCarScene() {
    setCarOpen(true);
    setCarInteriorOpen(false);
    setMapsOpen(false);
    setRadioOpen(false);
    setSelectedRoute("hfc");
  }

  function closeCarScene() {
    setCarOpen(false);
    setCarInteriorOpen(false);
    setMapsOpen(false);
    setRadioOpen(false);
    setSelectedRoute("hfc");
  }

  function movePuzzle(dx: number, dy: number) {
    setPuzzlePos((current) => {
      const next = {
        x: current.x + dx,
        y: current.y + dy,
      };

      if (!mazePath.has(`${next.x},${next.y}`)) {
        return current;
      }

      if (next.x === 5 && next.y === 5) {
        setTimeout(() => {
          setPcPuzzleOpen(false);
          setDesktopOpen(true);
        }, 250);
      }

      return next;
    });
  }

  function openTv() {
    setTvOpen(true);
    setTvStep("password");
    setPassword("");
    setPasswordError(false);
    startStaticSound();
  }

  function closeTv() {
    setTvOpen(false);
    setTvStep("password");
    setPassword("");
    setPasswordError(false);
    stopStaticSound();
  }

  function checkTvPassword() {
    if (password.trim().toLowerCase() === "komodo") {
      setPasswordError(false);
      stopStaticSound();
      setTvStep("menu");
    } else {
      setPasswordError(true);
    }
  }

  return (
    <main className="site">
      <img src="/images/room-main.png" alt="SOL Room" className="roomImage" />
      <div className="darkOverlay" />

      {landingOpen && (
        <section className="landingScreen">
          <div className="landingContent">
            <p className="landingMini">SOL WORLD</p>
            <h1>Coming Soon</h1>
            <p className="landingText">
              A visual world for music, films, archives, documentaries, and creative experiences that follows key locations in SOL life.
            </p>

            <div className="earlyAccessBox">
              <p>If you would like early access, enter password.</p>
              <input
                value={earlyPassword}
                onChange={(e) => {
                  setEarlyPassword(e.target.value);
                  setEarlyPasswordError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkEarlyPassword();
                }}
                type="password"
                placeholder="Password"
              />
              {earlyPasswordError && <span>Incorrect password.</span>}
              <button onClick={checkEarlyPassword}>Enter Early Access</button>
            </div>
          </div>
        </section>
      )}

      {!landingOpen && !desktopOpen && !tvOpen && !pcPuzzleOpen && !carOpen && <div className="logo">SOL</div>}

      {!landingOpen && !desktopOpen && !tvOpen && !pcPuzzleOpen && !carOpen && (
        <button className="hotspot watch" onClick={openTv}>
          Watch
        </button>
      )}

      {!landingOpen && !desktopOpen && !tvOpen && !pcPuzzleOpen && !carOpen && (
        <button className="hotspot enter" onClick={openPcPuzzle}>
          Enter
        </button>
      )}

      {!landingOpen && !desktopOpen && !tvOpen && !pcPuzzleOpen && !carOpen && (
        <button className="hotspot carExit" onClick={openCarScene}>
          ←
          <span>Exit To Car</span>
        </button>
      )}

      {carOpen && (
        <section className="carScene">
          <img src="/images/car-main.png" alt="SOL car outside" className="carImage" />
          <div className="carOverlay" />

          {!carInteriorOpen && (
            <button className="carBack" onClick={closeCarScene}>
              Back to Room
            </button>
          )}

          {!carInteriorOpen && (
            <button className="enterCarHotspot" onClick={() => setCarInteriorOpen(true)}>
              Enter Car
            </button>
          )}

          {carInteriorOpen && (
            <div className="carInteriorImageMode">
              <img src="/images/car-interior.png" alt="Inside SOL car" className="carInteriorImage" />
              <div className="carInteriorShade" />

              <button className="glassBackRoom" onClick={closeCarScene}>
                Back to Room
              </button>

              <button className="carInteriorBack" onClick={() => setCarInteriorOpen(false)}>
                Exit Car
              </button>

              <button className="interactiveRadioPulse" onClick={() => setRadioOpen(!radioOpen)}>
                Radio
              </button>
              <button className="interactiveMapPulse" onClick={() => setMapsOpen(!mapsOpen)}>
                Maps
              </button>
              {radioOpen && (
                <div className="radioPopup">
                  <div className="radioHeader">
                    <p>♫ RADIO</p>
                    <button onClick={() => setRadioOpen(false)}>×</button>
                  </div>

                  <div className="radioStation">
                    <span>SOL FM</span>
                    <h1>88.7</h1>
                    <small>PLAYING</small>
                    <h2>Track {currentSong + 1}</h2>
                  </div>

                  <div className="radioVisualizer">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <i key={i} style={{ animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>

                  <audio
                    ref={audioPlayerRef}
                    src={songs[currentSong]}
                    autoPlay
                    className="audioPlayer"
                  />

                  <div className="songButtons">
                    {songs.map((_, index) => (
                      <button
                        key={index}
                        className={currentSong === index ? "songChoice activeSong" : "songChoice"}
                        onClick={() => {
                          setCurrentSong(index);
                          setTimeout(() => {
                            audioPlayerRef.current?.play();
                          }, 50);
                        }}
                      >
                        Track {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mapsOpen && (
                <div className="interactiveMapPanel">
                <p className="panelLabel">MAPS</p>

                <div className="animatedMiniMap">
                  <svg viewBox="0 0 160 110" className="routeSvg" preserveAspectRatio="none">
                    <defs>
                      <pattern id="mapGrid" width="14" height="14" patternUnits="userSpaceOnUse">
                        <path
                          d="M 14 0 L 0 0 0 14"
                          fill="none"
                          stroke="rgba(130,255,130,0.08)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>

                    <rect width="160" height="110" fill="url(#mapGrid)" />

                    {selectedRoute === "hfc" ? (
                      <>
                        <path className="routeLineSolid" d="M22 88 L58 88 L58 64 L95 64 L95 36 L138 36" />
                        <circle cx="22" cy="88" r="6" className="routeDotGlow" />
                        <circle cx="138" cy="36" r="6" className="routeDotGlow endDotPulse" />
                        <circle r="4.5" className="movingDot">
                          <animateMotion dur="2.7s" repeatCount="indefinite" path="M22 88 L58 88 L58 64 L95 64 L95 36 L138 36" />
                        </circle>
                      </>
                    ) : (
                      <>
                        <path className="routeLineSolid" d="M22 88 L54 88 L78 72 L102 72 L102 48 L138 28" />
                        <circle cx="22" cy="88" r="6" className="routeDotGlow" />
                        <circle cx="138" cy="28" r="6" className="routeDotGlow endDotPulse" />
                        <circle r="4.5" className="movingDot">
                          <animateMotion dur="2.7s" repeatCount="indefinite" path="M22 88 L54 88 L78 72 L102 72 L102 48 L138 28" />
                        </circle>
                      </>
                    )}
                  </svg>
                </div>

                <button className={selectedRoute === "hfc" ? "routeChoice active" : "routeChoice"} onClick={() => setSelectedRoute("hfc")}>
                  Go to HFC ›
                </button>
                <button className={selectedRoute === "umich" ? "routeChoice active" : "routeChoice"} onClick={() => setSelectedRoute("umich")}>
                  Go to UMich ›
                </button>
              </div>
              )}
            </div>
          )}
        </section>
      )}

      {pcPuzzleOpen && (
        <section className="pcPuzzleScreen">
          <button className="puzzleBack" onClick={() => setPcPuzzleOpen(false)}>
            Back to Room
          </button>

          <div className="puzzleCard">
            <p className="puzzleMini">SOL 95 ACCESS</p>
            <h1>Complete the maze</h1>
            <p className="puzzleText">Use the buttons or your arrow keys to reach ENTER.</p>

            <div className="mazeBoard">
              {Array.from({ length: 36 }).map((_, index) => {
                const x = index % 6;
                const y = Math.floor(index / 6);
                const isPath = mazePath.has(`${x},${y}`);
                const isPlayer = puzzlePos.x === x && puzzlePos.y === y;
                const isEnd = x === 5 && y === 5;

                return (
                  <div key={index} className={isPath ? "mazeCell path" : "mazeCell wall"}>
                    {isPlayer && <span className="playerDot">▶</span>}
                    {isEnd && !isPlayer && <span className="endDot">ENTER</span>}
                  </div>
                );
              })}
            </div>

            <div className="puzzleControls">
              <button onClick={() => movePuzzle(0, -1)}>↑</button>
              <div>
                <button onClick={() => movePuzzle(-1, 0)}>←</button>
                <button onClick={() => movePuzzle(1, 0)}>→</button>
              </div>
              <button onClick={() => movePuzzle(0, 1)}>↓</button>
            </div>
          </div>
        </section>
      )}

      {desktopOpen && (
        <section className="retroScreen">
          <div className="desktopIcons">
            {folders.map((folder) => (
              <button key={folder.name} className="desktopIcon" onClick={() => setActiveFolder(folder.name)}>
                <span className="iconBox">{folder.icon}</span>
                <span>{folder.name}</span>
              </button>
            ))}
          </div>

          <div className="window mainWindow">
            <div className="windowTop">
              <span>My Computer</span>
              <div className="windowButtons">
                <button>_</button>
                <button>□</button>
                <button onClick={() => setDesktopOpen(false)}>×</button>
              </div>
            </div>
            <div className="menuBar">
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Help</span>
            </div>
            <div className="windowBody">
              <div className="driveGrid">
                {folders.map((folder) => (
                  <button key={folder.name} className="drive" onClick={() => setActiveFolder(folder.name)}>
                    <div className="folderIcon">📁</div>
                    <p>{folder.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="startMenu">
            <div className="startSide">SOL 95</div>
            <div className="startItems">
              <button>Programs ▸</button>
              <button>Documents ▸</button>
              <button>Settings ▸</button>
              <button>Find</button>
              <button>Help</button>
              <button onClick={() => setDesktopOpen(false)}>Shut Down...</button>
            </div>
          </div>

          {activeFolder && (
            <div className="window folderWindow">
              <div className="windowTop">
                <span>{activeFolder}</span>
                <div className="windowButtons">
                  <button>_</button>
                  <button>□</button>
                  <button onClick={() => setActiveFolder(null)}>×</button>
                </div>
              </div>
              <div className="menuBar">
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Help</span>
              </div>
              <div className="maintenance">
                <div className="warningIcon">!</div>
                <h2>{activeFolder} is currently under maintenance</h2>
                <p>This section is being built. Check back soon.</p>
                <button onClick={() => setActiveFolder(null)}>OK</button>
              </div>
            </div>
          )}

          <div className="taskbar">
            <button className="startButton">Start</button>
            <button className="taskButton">My Computer</button>
            {activeFolder && <button className="taskButton">{activeFolder}</button>}
            <div className="clock">1:52 PM</div>
          </div>
        </section>
      )}

      {tvOpen && (
        <section className="tvMode">
          {tvStep !== "movies" && (
            <button className="tvBack" onClick={closeTv}>
              Back to Room
            </button>
          )}

          {tvStep === "password" && (
            <div className="blueScreen">
              <div className="scanlines" />
              <div className="passwordBox">
                <h1>SOL TV ACCESS</h1>
                <p>Enter password to continue.</p>
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") checkTvPassword();
                  }}
                  placeholder="Password"
                  type="password"
                  autoFocus
                />
                {passwordError && <span className="passwordError">Access denied. Try again.</span>}
                <button onClick={checkTvPassword}>ENTER</button>
                <small>I'm patient and plot everything out, when its my time to spit fire comes out but I'm not a dragon</small>
              </div>
            </div>
          )}

          {tvStep === "menu" && (
            <div className="oldTvShell">
              <div className="oldTvScreen">
                <div className="tvStatic" />
                <div className="appGrid">
                  <button className="tvApp solMovies" onClick={() => setTvStep("movies")}>
                    <span className="appIcon">S</span>
                    <span>SOL Movies</span>
                  </button>
                </div>
              </div>
              <div className="tvBrand">Sol 426 Edition TV</div>
            </div>
          )}

          {tvStep === "movies" && (
            <div className="miniNetflix">
              <div className="miniTop">
                <button className="movieBackRoom" onClick={closeTv}>
                  Back to Room
                </button>
                <div className="miniLogo">SOL MOVIES</div>
                <button className="movieMenuButton" onClick={() => setTvStep("menu")}>
                  ← TV Menu
                </button>
              </div>

              <div className="heroMovie">
                <p className="eyebrow">ORIGINAL SERIES</p>
                <h1>ARIES</h1>
                <h2>EP 1</h2>
                <p className="movieDesc">
                  A visual world for the beginning of sol music, sol documentaries, sol videos etc. Coming soon.
                </p>
                <button className="comingSoon">Coming Soon</button>
              </div>

              <div className="movieRow">
                <h3>Featured</h3>
                <div className="movieCard">
                  <div className="poster">
                    ARIES
                    <br />
                    <span>EP 1</span>
                  </div>
                  <p>Aries Episode 1</p>
                  <small>Coming soon</small>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        .site {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
          position: relative;
          font-family: Arial, sans-serif;
        }

        .roomImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }

        .darkOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.36));
          pointer-events: none;
        }

        .logo {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 28px;
          letter-spacing: 8px;
          font-weight: 700;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }

        .hotspot {
          position: absolute;
          border-radius: 999px;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          backdrop-filter: blur(4px);
          background: rgba(255, 255, 255, 0.08);
          cursor: pointer;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.48);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .hotspot:hover {
          transform: scale(1.06);
          background: rgba(255, 255, 255, 0.16);
        }

        .watch {
          right: 18%;
          top: 57%;
          width: 90px;
          height: 90px;
          font-size: 18px;
        }

        .enter {
          right: 34%;
          top: 51%;
          width: 110px;
          height: 110px;
          font-size: 22px;
        }

        .carExit {
          left: 8%;
          top: 57%;
          width: 120px;
          height: 120px;
          font-size: 42px;
          flex-direction: column;
          gap: 5px;
          background: rgba(255, 255, 255, 0.08);
          border: 2px solid white;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.55);
        }

        .carExit span {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-align: center;
          line-height: 1.15;
        }

        .landingScreen {
          position: absolute;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at center, rgba(60, 20, 30, 0.5), rgba(0, 0, 0, 0.86)), url('/images/room-main.png');
          background-size: cover;
          background-position: center;
          color: white;
        }

        .landingScreen::before {
          content: "";
          position: absolute;
          inset: 0;
          backdrop-filter: blur(7px);
          background: rgba(0, 0, 0, 0.28);
        }

        .landingContent {
          position: relative;
          z-index: 2;
          width: min(760px, 88vw);
          text-align: center;
          padding: 42px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 28px;
          background: rgba(0, 0, 0, 0.34);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
        }

        .landingMini {
          letter-spacing: 0.55em;
          font-size: 13px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.72);
          margin: 0 0 16px;
        }

        .landingContent h1 {
          font-size: clamp(62px, 10vw, 128px);
          line-height: 0.9;
          margin: 0;
          font-weight: 950;
          letter-spacing: -0.06em;
        }

        .landingText {
          width: min(620px, 100%);
          margin: 24px auto 0;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.82);
        }

        .earlyAccessBox {
          margin: 34px auto 0;
          width: min(430px, 100%);
          display: grid;
          gap: 12px;
        }

        .earlyAccessBox p {
          margin: 0;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.78);
        }

        .earlyAccessBox input {
          height: 48px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.32);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          text-align: center;
          font-size: 17px;
          outline: none;
          backdrop-filter: blur(8px);
        }

        .earlyAccessBox input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .earlyAccessBox span {
          color: #ffd3d3;
          font-weight: 900;
        }

        .earlyAccessBox button {
          height: 50px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: white;
          color: #050505;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .carScene {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: #000;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }

        .carImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carOverlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 62% 52%, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.52));
          pointer-events: none;
        }

        .carBack,
        .carInteriorBack {
          position: absolute;
          top: 24px;
          z-index: 20;
          background: rgba(0, 0, 0, 0.55);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 999px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .carBack {
          left: 24px;
        }

        .carInteriorBack {
          right: 24px;
        }

        .enterCarHotspot {
          position: absolute;
          left: 50%;
          top: 55%;
          transform: translate(-50%, -50%);
          z-index: 6;
          width: 130px;
          height: 130px;
          border-radius: 999px;
          border: 2px solid white;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          font-size: 18px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 0 32px rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(6px);
          transition: 0.2s ease;
        }

        .enterCarHotspot:hover {
          transform: translate(-50%, -50%) scale(1.07);
          background: rgba(255, 255, 255, 0.16);
        }

        .carInterior {
          position: absolute;
          inset: 0;
          z-index: 12;
          overflow: hidden;
          background: radial-gradient(circle at 50% 5%, #352019, #060504 72%);
          color: #8cff8c;
          font-family: "Courier New", monospace;
        }

        .windshieldView {
          position: absolute;
          inset: 0 0 42% 0;
          background: linear-gradient(to bottom, #2c211c, #110d0b 65%, #090807);
          overflow: hidden;
          border-bottom: 24px solid #090909;
        }

        .streetGlow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 18% 32%, rgba(255, 177, 77, 0.32), transparent 16%),
            radial-gradient(circle at 78% 40%, rgba(255, 177, 77, 0.28), transparent 18%),
            linear-gradient(to bottom, rgba(255, 160, 70, 0.12), transparent 60%);
        }

        .roadLine {
          position: absolute;
          left: 50%;
          bottom: -20px;
          width: 5px;
          height: 220px;
          background: rgba(255, 191, 92, 0.65);
          transform: translateX(-50%) perspective(200px) rotateX(60deg);
          box-shadow: 0 0 20px rgba(255, 191, 92, 0.4);
        }

        .house {
          position: absolute;
          bottom: 92px;
          width: 130px;
          height: 70px;
          background: rgba(100, 65, 45, 0.62);
          border: 1px solid rgba(255, 175, 90, 0.18);
        }

        .h1 { left: 7%; }
        .h2 { right: 9%; width: 160px; }
        .h3 { left: 38%; bottom: 110px; width: 115px; height: 58px; }

        .house::after {
          content: "";
          position: absolute;
          left: 18px;
          top: 18px;
          width: 24px;
          height: 18px;
          background: rgba(255, 198, 100, 0.52);
          box-shadow: 58px 8px 0 rgba(255, 198, 100, 0.28);
        }

        .tree {
          position: absolute;
          bottom: 55px;
          width: 12px;
          height: 210px;
          background: rgba(20, 13, 10, 0.88);
          transform-origin: bottom;
        }

        .t1 { left: 28%; transform: rotate(-13deg); }
        .t2 { right: 25%; transform: rotate(10deg); }

        .tree::after {
          content: "";
          position: absolute;
          left: -75px;
          top: -36px;
          width: 165px;
          height: 120px;
          border-radius: 50%;
          background: rgba(12, 8, 6, 0.82);
          filter: blur(3px);
        }

        .wheel {
          position: absolute;
          left: 13%;
          bottom: 11%;
          width: 330px;
          height: 330px;
          border-radius: 50%;
          border: 42px solid #080808;
          box-shadow: inset 0 0 0 8px #181818, 0 18px 50px rgba(0, 0, 0, 0.7);
        }

        .wheelCenter {
          position: absolute;
          inset: 68px;
          border-radius: 50%;
          background: radial-gradient(circle, #171717, #050505);
          border: 3px solid rgba(255, 255, 255, 0.08);
        }

        .speedCluster {
          position: absolute;
          left: 26%;
          bottom: 36%;
          width: 250px;
          height: 130px;
          border-radius: 28px;
          background: radial-gradient(circle, rgba(34, 92, 34, 0.32), rgba(0, 0, 0, 0.78));
          border: 1px solid rgba(140, 255, 140, 0.2);
          display: grid;
          place-items: center;
          text-shadow: 0 0 10px rgba(140, 255, 140, 0.85);
        }

        .pixelTitle {
          position: absolute;
          top: 12px;
          left: 18px;
          font-size: 12px;
          letter-spacing: 0.15em;
        }

        .speedNumber {
          font-size: 54px;
          line-height: 1;
          margin-top: 8px;
        }

        .mph {
          position: absolute;
          top: 48px;
          right: 54px;
          font-size: 13px;
        }

        .fuelLine {
          position: absolute;
          bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .fuelLine div {
          display: flex;
          gap: 3px;
        }

        .fuelLine i {
          width: 13px;
          height: 8px;
          background: #8cff8c;
          display: block;
          box-shadow: 0 0 8px rgba(140, 255, 140, 0.7);
        }

        .carPlay {
          position: absolute;
          right: 8%;
          bottom: 31%;
          width: 390px;
          min-height: 260px;
          border-radius: 22px;
          border: 2px solid rgba(140, 255, 140, 0.28);
          background:
            repeating-linear-gradient(to bottom, rgba(140, 255, 140, 0.05) 0 1px, transparent 1px 4px),
            linear-gradient(180deg, rgba(9, 30, 12, 0.96), rgba(1, 8, 2, 0.96));
          box-shadow: inset 0 0 28px rgba(140, 255, 140, 0.08), 0 20px 60px rgba(0, 0, 0, 0.7);
          padding: 18px;
          text-shadow: 0 0 9px rgba(140, 255, 140, 0.8);
        }

        .carPlayTop {
          display: flex;
          justify-content: space-between;
          font-weight: 900;
          margin-bottom: 14px;
          letter-spacing: 0.08em;
        }

        .carPlayMenu {
          display: grid;
          gap: 10px;
        }

        .carPlayItem {
          min-height: 58px;
          border: 1px solid rgba(140, 255, 140, 0.2);
          background: rgba(140, 255, 140, 0.08);
          color: #8cff8c;
          display: grid;
          grid-template-columns: 52px 1fr 24px;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }

        .carPlayItem.active {
          background: rgba(140, 255, 140, 0.28);
        }

        .carPlayItem.dim {
          opacity: 0.75;
        }

        .carPlayItem span {
          width: 42px;
          height: 42px;
          background: rgba(140, 255, 140, 0.18);
          display: grid;
          place-items: center;
          font-size: 25px;
          border-radius: 8px;
        }

        .carPlayItem b {
          font-size: 21px;
          letter-spacing: 0.08em;
        }

        .carPlayItem small {
          display: block;
          margin-top: 4px;
          color: rgba(140, 255, 140, 0.68);
        }

        .carPlayItem em {
          font-style: normal;
          font-size: 34px;
        }

        .carPlayMaps {
          display: grid;
          gap: 10px;
        }

        .miniBack {
          justify-self: start;
          background: transparent;
          border: 1px solid rgba(140, 255, 140, 0.25);
          color: #8cff8c;
          padding: 7px 12px;
          cursor: pointer;
          font-family: inherit;
        }

        .carPlayMaps h2 {
          margin: 0;
          letter-spacing: 0.12em;
          font-size: 28px;
        }

        .miniMap {
          height: 92px;
          border: 1px solid rgba(140, 255, 140, 0.22);
          background:
            linear-gradient(rgba(140, 255, 140, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(140, 255, 140, 0.08) 1px, transparent 1px);
          background-size: 22px 22px;
          position: relative;
          overflow: hidden;
        }

        .routeLine {
          position: absolute;
          left: 42px;
          bottom: 22px;
          width: 250px;
          height: 55px;
          border-left: 4px solid #8cff8c;
          border-bottom: 4px solid #8cff8c;
          border-top: 4px solid #8cff8c;
          transform: skewX(-20deg);
          filter: drop-shadow(0 0 8px rgba(140, 255, 140, 0.8));
        }

        .routeDot {
          position: absolute;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #8cff8c;
          box-shadow: 0 0 10px rgba(140, 255, 140, 0.9);
        }

        .routeDot.start { left: 34px; bottom: 17px; }
        .routeDot.end { right: 40px; top: 18px; }

        .destinationBtn {
          height: 45px;
          border: 1px solid rgba(140, 255, 140, 0.2);
          background: rgba(140, 255, 140, 0.12);
          color: #8cff8c;
          font-family: inherit;
          font-size: 17px;
          font-weight: 900;
          text-align: left;
          padding: 0 16px;
          cursor: pointer;
        }

        .destinationBtn:hover {
          background: rgba(140, 255, 140, 0.24);
        }

        .bottomConsole {
          position: absolute;
          left: 2%;
          right: 2%;
          bottom: 18px;
          height: 170px;
          border: 1px solid rgba(140, 255, 140, 0.18);
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.75);
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          overflow: hidden;
          box-shadow: 0 -18px 70px rgba(0, 0, 0, 0.65);
        }

        .consoleCard {
          padding: 18px 22px;
          border-right: 1px solid rgba(140, 255, 140, 0.14);
          text-shadow: 0 0 8px rgba(140, 255, 140, 0.7);
        }

        .consoleCard:last-child {
          border-right: none;
        }

        .consoleCard p {
          margin: 0 0 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .consoleCard h2 {
          margin: 0;
          color: #8cff8c;
        }

        .consoleCard h2 span {
          font-size: 46px;
        }

        .consoleCard small {
          display: block;
          color: rgba(140, 255, 140, 0.72);
          line-height: 1.45;
          text-transform: uppercase;
        }

        .consoleCard button {
          display: block;
          width: 80%;
          height: 42px;
          margin: 8px 0;
          border: 1px solid rgba(140, 255, 140, 0.22);
          background: rgba(140, 255, 140, 0.12);
          color: #8cff8c;
          font-family: inherit;
          font-weight: 900;
          text-align: left;
          padding: 0 16px;
          cursor: pointer;
        }

        .tinyCar {
          font-size: 62px;
          line-height: 0.7;
          margin-bottom: 12px;
        }

        @media (max-width: 900px) {
          .wheel,
          .speedCluster {
            display: none;
          }

          .carPlay {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            top: 18%;
            bottom: auto;
            width: min(390px, 88vw);
          }

          .bottomConsole {
            height: auto;
            grid-template-columns: 1fr;
            max-height: 40vh;
            overflow: auto;
          }
        }

        .carInteriorImageMode {
          position: absolute;
          inset: 0;
          z-index: 12;
          overflow: hidden;
          background: #000;
          font-family: "Courier New", monospace;
        }

        .carInteriorImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carInteriorShade {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 45%, rgba(0,0,0,0), rgba(0,0,0,0.28));
          pointer-events: none;
        }

        .glassBackRoom {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 20;
          background: rgba(0, 0, 0, 0.55);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 999px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .interactiveRadioPulse {
          position: absolute;
          left: 5.5%;
          bottom: 9%;
          z-index: 22;
          width: 185px;
          height: 86px;
          border-radius: 14px;
          border: 1px solid rgba(130, 255, 130, 0.75);
          background: rgba(0, 60, 0, 0.16);
          color: #8cff8c;
          font-family: inherit;
          font-size: 22px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 0 18px rgba(130, 255, 130, 0.25);
          text-shadow: 0 0 10px rgba(130, 255, 130, 0.85);
          animation: pulseGreen 1.7s infinite ease-in-out;
        }


        .interactiveMapPulse {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 8%;
          z-index: 22;
          width: 220px;
          height: 74px;
          border-radius: 12px;
          border: 1px solid rgba(130, 255, 130, 0.78);
          background: rgba(0, 60, 0, 0.18);
          color: #8cff8c;
          font-family: inherit;
          font-size: 20px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 0 18px rgba(130, 255, 130, 0.22);
          text-shadow: 0 0 10px rgba(130, 255, 130, 0.85);
          animation: pulseGreen 1.7s infinite ease-in-out;
        }

        .interactiveMapPanel {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 14%;
          z-index: 41;
          width: 420px;
          min-height: 230px;
          border-radius: 18px;
          border: 1px solid rgba(130, 255, 130, 0.78);
          background:
            repeating-linear-gradient(to bottom, rgba(130,255,130,0.045) 0 1px, transparent 1px 4px),
            linear-gradient(180deg, rgba(0, 25, 0, 0.86), rgba(0, 0, 0, 0.9));
          box-shadow: 0 0 34px rgba(130, 255, 130, 0.28);
          padding: 18px;
          color: #8cff8c;
          text-shadow: 0 0 10px rgba(130, 255, 130, 0.75);
          backdrop-filter: blur(8px);
          animation: radioSlideUp .35s ease;
        }

        .panelLabel {
          margin: 0 0 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
          font-size: 14px;
        }

        .animatedMiniMap {
          position: absolute;
          top: 54px;
          right: 18px;
          width: 160px;
          height: 138px;
          border: 1px solid rgba(130, 255, 130, 0.42);
          background: rgba(0, 0, 0, 0.42);
          overflow: hidden;
          border-radius: 10px;
          box-shadow: inset 0 0 20px rgba(130, 255, 130, 0.08);
        }

        .routeSvg {
          width: 100%;
          height: 100%;
        }

        .routeLineSolid {
          fill: none;
          stroke: #8cff8c;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 9px rgba(130, 255, 130, 0.95));
        }

        .routeDotGlow {
          fill: #8cff8c;
          filter: drop-shadow(0 0 9px rgba(130, 255, 130, 1));
        }

        .endDotPulse {
          animation: mapPulse 1.2s infinite ease-in-out;
        }

        .movingDot {
          fill: white;
          filter: drop-shadow(0 0 9px white) drop-shadow(0 0 14px rgba(130,255,130,.95));
        }

        .routeChoice {
          width: 210px;
          height: 58px;
          display: block;
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(130, 255, 130, 0.46);
          background: rgba(130, 255, 130, 0.08);
          color: #8cff8c;
          font-family: inherit;
          font-size: 16px;
          font-weight: 900;
          text-align: left;
          padding: 0 18px;
          cursor: pointer;
          text-shadow: inherit;
        }

        .routeChoice.active,
        .routeChoice:hover {
          background: rgba(130, 255, 130, 0.28);
          box-shadow: 0 0 15px rgba(130, 255, 130, 0.22);
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.025); }
        }

        @keyframes mapPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .radioPopup {
          position: absolute;
          left: 4%;
          bottom: 18%;
          z-index: 42;
          width: 360px;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(130,255,130,0.7);
          background:
            repeating-linear-gradient(to bottom, rgba(130,255,130,0.05) 0 1px, transparent 1px 4px),
            linear-gradient(180deg, rgba(0,20,0,0.95), rgba(0,0,0,0.95));
          box-shadow: 0 0 30px rgba(130,255,130,0.28);
          color: #8cff8c;
          text-shadow: 0 0 10px rgba(130,255,130,0.8);
          animation: radioSlideUp .4s ease;
          backdrop-filter: blur(10px);
        }

        .radioHeader {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:14px;
        }

        .radioHeader p {
          margin:0;
          font-size:16px;
          font-weight:900;
          letter-spacing:.14em;
        }

        .radioHeader button {
          width:32px;
          height:32px;
          border-radius:999px;
          border:1px solid rgba(130,255,130,.4);
          background:rgba(130,255,130,.08);
          color:#8cff8c;
          font-size:20px;
          cursor:pointer;
        }

        .radioStation {
          padding:14px;
          border-radius:14px;
          background:rgba(130,255,130,.08);
          border:1px solid rgba(130,255,130,.18);
        }

        .radioStation span,
        .radioStation small {
          display:block;
          color:rgba(140,255,140,.72);
          letter-spacing:.14em;
          font-size:12px;
          font-weight:900;
        }

        .radioStation h1 {
          margin:8px 0;
          font-size:72px;
          line-height:.9;
        }

        .radioStation h2 {
          margin:4px 0 0;
          font-size:18px;
        }

        .radioVisualizer {
          height:60px;
          display:flex;
          align-items:end;
          justify-content:center;
          gap:6px;
          margin:16px 0;
        }

        .radioVisualizer i {
          width:8px;
          border-radius:999px;
          background:#8cff8c;
          animation:radioBars .8s infinite alternate ease-in-out;
          box-shadow:0 0 10px rgba(130,255,130,.9);
        }

        .audioPlayer {
          display: none;
        }

        .songButtons {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:14px;
        }

        .songChoice {
          height:42px;
          border:1px solid rgba(130,255,130,.3);
          background:rgba(130,255,130,.08);
          color:#8cff8c;
          font-family:inherit;
          font-weight:900;
          cursor:pointer;
        }

        .songChoice:hover,
        .activeSong {
          background:rgba(130,255,130,.25);
          box-shadow:0 0 14px rgba(130,255,130,.3);
        }

        @keyframes radioBars {
          0% { height:12px; }
          100% { height:54px; }
        }

        @keyframes radioSlideUp {
          from {
            opacity:0;
            transform:translateY(20px) scale(.96);
          }
          to {
            opacity:1;
            transform:translateY(0) scale(1);
          }
        }

        @media (max-width: 900px) {
          .interactiveMapPanel {
            width: 90vw;
            max-width: 420px;
            left: 50%;
            transform: translateX(-50%);
            bottom: 3%;
            padding: 16px;
          }

          .animatedMiniMap {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: 150px;
            margin-bottom: 18px;
          }

          .routeChoice {
            width: 100%;
          }

          .interactiveRadioPulse {
            left: 50%;
            transform: translateX(-50%);
            bottom: 8%;
            width: 200px;
            height: 72px;
          }

          .interactiveMapPulse {
            right: 50%;
            transform: translateX(50%);
            bottom: 22%;
            width: 200px;
            height: 62px;
          }

          .radioPopup {
            width: 88vw;
            left: 50%;
            transform: translateX(-50%);
            bottom: 18%;
          }
        }

        .pcPuzzleScreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background:
            radial-gradient(circle at center, rgba(0, 60, 120, 0.2), transparent 42%),
            #000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: "Courier New", monospace;
          overflow: hidden;
          padding: 24px;
          box-sizing: border-box;
        }

        .puzzleBack {
          position: fixed;
          top: 22px;
          left: 22px;
          background: rgba(20, 20, 20, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: white;
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 15px;
          cursor: pointer;
          font-weight: bold;
          z-index: 10000;
        }

        .puzzleCard {
          width: min(520px, 92vw);
          max-height: 88vh;
          overflow: auto;
          background: linear-gradient(180deg, #06183f, #031027);
          border: 2px solid #0ea5ff;
          box-shadow: 0 0 30px rgba(0, 120, 255, 0.55);
          padding: 24px 28px 26px;
          text-align: center;
          box-sizing: border-box;
        }

        .puzzleMini {
          letter-spacing: 0.32em;
          color: #9dd7ff;
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 900;
        }

        .puzzleCard h1 {
          font-size: clamp(30px, 4vw, 44px);
          margin: 0 0 8px;
          font-weight: 400;
          line-height: 1;
        }

        .puzzleText {
          color: rgba(255, 255, 255, 0.68);
          margin: 0 auto 18px;
          font-size: 14px;
          line-height: 1.45;
          max-width: 340px;
        }

        .mazeBoard {
          width: min(300px, 70vw);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(6, 1fr);
          background: black;
          border: 6px solid black;
          gap: 5px;
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.45);
        }

        .mazeCell {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .mazeCell.wall {
          background: black;
        }

        .mazeCell.path {
          background: #1f8fe5;
        }

        .playerDot {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: #ffd23f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(255, 210, 63, 0.85);
        }

        .endDot {
          background: #70ff70;
          color: black;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: bold;
        }

        .puzzleControls {
          margin-top: 18px;
          display: grid;
          place-items: center;
          gap: 8px;
        }

        .puzzleControls div {
          display: flex;
          gap: 42px;
        }

        .puzzleControls button {
          width: 54px;
          height: 42px;
          border: 2px solid white;
          background: #1f8fe5;
          color: white;
          font-size: 22px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
        }

        @media (max-height: 760px) {
          .puzzleCard {
            transform: scale(0.88);
          }
        }

        @media (max-height: 650px) {
          .puzzleCard {
            transform: scale(0.78);
          }
        }

        .retroScreen {
          position: absolute;
          inset: 0;
          z-index: 20;
          background: #008080;
          color: black;
          font-family: "MS Sans Serif", Arial, sans-serif;
          overflow: hidden;
        }

        .retroScreen::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 4px);
          mix-blend-mode: overlay;
        }

        .desktopIcons {
          position: absolute;
          top: 28px;
          left: 24px;
          display: grid;
          gap: 22px;
          z-index: 3;
        }

        .desktopIcon {
          width: 78px;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          text-align: center;
          text-shadow: 1px 1px #000;
          font-size: 13px;
        }

        .iconBox {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin: 0 auto 5px;
          font-size: 30px;
        }

        .window {
          position: absolute;
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.28);
          z-index: 5;
        }

        .mainWindow {
          width: 520px;
          height: 330px;
          top: 86px;
          right: 95px;
        }

        .folderWindow {
          width: 430px;
          height: 270px;
          left: 50%;
          top: 52%;
          transform: translate(-50%, -50%);
          z-index: 12;
        }

        .windowTop {
          height: 28px;
          background: linear-gradient(90deg, #000080, #1084d0);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 8px;
          font-size: 14px;
        }

        .windowButtons {
          display: flex;
          gap: 3px;
          padding-right: 4px;
        }

        .windowButtons button {
          width: 22px;
          height: 20px;
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          font-size: 12px;
          line-height: 12px;
          cursor: pointer;
        }

        .menuBar {
          height: 27px;
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 0 10px;
          font-size: 14px;
          border-bottom: 1px solid #808080;
        }

        .windowBody {
          padding: 26px;
        }

        .driveGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
        }

        .drive {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }

        .folderIcon {
          font-size: 42px;
        }

        .drive p {
          margin: 6px 0 0;
        }

        .startMenu {
          position: absolute;
          left: 0;
          bottom: 34px;
          width: 330px;
          height: 310px;
          display: flex;
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          z-index: 4;
        }

        .startSide {
          width: 46px;
          background: linear-gradient(#000080, #000);
          color: white;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 24px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 1px;
        }

        .startItems {
          flex: 1;
          display: grid;
          padding: 8px;
        }

        .startItems button {
          background: transparent;
          border: none;
          text-align: left;
          padding: 8px 10px;
          font-size: 15px;
          cursor: pointer;
        }

        .startItems button:hover {
          background: #000080;
          color: white;
        }

        .maintenance {
          padding: 26px;
          text-align: center;
        }

        .warningIcon {
          width: 46px;
          height: 46px;
          background: #ffd84d;
          border: 2px solid black;
          margin: 0 auto 12px;
          display: grid;
          place-items: center;
          font-size: 30px;
          font-weight: 900;
        }

        .maintenance h2 {
          font-size: 19px;
          margin: 10px 0;
        }

        .maintenance p {
          font-size: 14px;
          margin-bottom: 18px;
        }

        .maintenance button {
          width: 90px;
          padding: 5px;
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          cursor: pointer;
        }

        .taskbar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 34px;
          background: #c0c0c0;
          border-top: 2px solid #fff;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 5px;
          z-index: 30;
        }

        .startButton,
        .taskButton {
          height: 26px;
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          font-weight: 700;
          cursor: pointer;
        }

        .startButton {
          width: 76px;
        }

        .taskButton {
          min-width: 130px;
          text-align: left;
          padding-left: 8px;
        }

        .clock {
          margin-left: auto;
          height: 24px;
          min-width: 88px;
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #fff;
          border-bottom: 2px solid #fff;
          display: grid;
          place-items: center;
          font-size: 13px;
        }

        .tvMode {
          position: absolute;
          inset: 0;
          z-index: 25;
          background: radial-gradient(circle at center, #17100d, #060403 70%);
          color: white;
          overflow: hidden;
        }

        .tvBack {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 40;
          background: rgba(0, 0, 0, 0.45);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 700;
        }

        .blueScreen {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: #0037b8;
          color: white;
          font-family: "Courier New", monospace;
        }

        .blueScreen::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 45%), repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 4px);
          opacity: 0.55;
          pointer-events: none;
        }

        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0 2px, transparent 2px 5px);
          pointer-events: none;
        }

        .passwordBox {
          position: relative;
          z-index: 5;
          width: 440px;
          max-width: 88vw;
          border: 2px solid white;
          padding: 28px;
          background: rgba(0, 0, 80, 0.35);
          box-shadow: 0 0 45px rgba(255, 255, 255, 0.25);
          text-align: center;
        }

        .passwordBox h1 {
          margin: 0 0 10px;
          font-size: 30px;
          letter-spacing: 0.08em;
        }

        .passwordBox p {
          margin: 0 0 20px;
          color: #d8e6ff;
        }

        .passwordBox input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px;
          background: #001b5c;
          color: white;
          border: 2px solid white;
          font-family: inherit;
          font-size: 18px;
          outline: none;
          text-align: center;
        }

        .passwordBox input::placeholder {
          color: rgba(255, 255, 255, 0.55);
        }

        .passwordBox button {
          margin-top: 16px;
          width: 140px;
          padding: 11px;
          background: white;
          color: #0037b8;
          border: none;
          font-weight: 900;
          cursor: pointer;
          font-family: inherit;
        }

        .passwordBox small {
          display: block;
          margin-top: 14px;
          color: #cbd8ff;
          opacity: 0.85;
        }

        .passwordError {
          display: block;
          margin-top: 10px;
          color: #ffdddd;
          font-weight: 900;
        }

        .oldTvShell {
          position: absolute;
          left: 50%;
          top: 54%;
          transform: translate(-50%, -50%);
          width: 880px;
          max-width: 92vw;
          height: 610px;
          max-height: 78vh;
          background: linear-gradient(135deg, #311c12, #6b4328, #1c100b);
          border-radius: 34px;
          padding: 42px;
          box-shadow: inset 0 0 0 10px rgba(255, 255, 255, 0.06), 0 35px 90px rgba(0, 0, 0, 0.75);
        }

        .oldTvScreen {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 28px / 42px;
          overflow: hidden;
          background: radial-gradient(circle at center, #5b5d65, #23242b 75%);
          border: 8px solid #1a1512;
          box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.85);
        }

        .tvStatic {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 4px), radial-gradient(circle at center, transparent 0 60%, rgba(0, 0, 0, 0.35));
          pointer-events: none;
        }

        .appGrid {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          height: 100%;
        }

        .tvApp {
          width: 210px;
          height: 150px;
          border-radius: 18px;
          border: 3px solid rgba(255, 255, 255, 0.35);
          background: linear-gradient(135deg, #101010, #b20e1c);
          color: white;
          font-size: 24px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
          display: grid;
          place-items: center;
          gap: 6px;
        }

        .tvApp:hover {
          transform: scale(1.05);
        }

        .appIcon {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          background: #e50914;
          display: grid;
          place-items: center;
          font-size: 34px;
        }

        .tvBrand {
          position: absolute;
          right: 46px;
          bottom: 18px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 12px;
          letter-spacing: 0.25em;
        }

        .miniNetflix {
          position: absolute;
          inset: 0;
          background: #070707;
          font-family: Arial, sans-serif;
        }

        .miniTop {
          position: relative;
          z-index: 10;
          height: 92px;
          display: grid;
          grid-template-columns: 180px 1fr 180px;
          align-items: center;
          padding: 0 42px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.65), transparent);
        }

        .miniLogo {
          color: #e50914;
          font-size: 31px;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-align: center;
        }

        .miniTop button {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 11px 15px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 800;
        }

        .movieBackRoom {
          justify-self: start;
        }

        .movieMenuButton {
          justify-self: end;
        }

        .heroMovie {
          min-height: 53vh;
          padding: 92px 52px 70px;
          background: radial-gradient(circle at 75% 30%, rgba(145, 34, 52, 0.55), transparent 35%), linear-gradient(90deg, #111 0%, #111 35%, rgba(15, 15, 15, 0.55));
        }

        .eyebrow {
          color: #aaa;
          letter-spacing: 0.22em;
          font-size: 13px;
          font-weight: 800;
        }

        .heroMovie h1 {
          font-size: 92px;
          margin: 8px 0 0;
          letter-spacing: 0.04em;
        }

        .heroMovie h2 {
          font-size: 34px;
          margin: 0 0 18px;
          color: #d3d3d3;
        }

        .movieDesc {
          width: 610px;
          max-width: 90vw;
          font-size: 17px;
          line-height: 1.55;
          color: #d0d0d0;
        }

        .comingSoon {
          margin-top: 16px;
          background: white;
          color: black;
          border: none;
          padding: 13px 25px;
          border-radius: 5px;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
        }

        .movieRow {
          padding: 24px 52px;
        }

        .movieRow h3 {
          margin: 0 0 14px;
          font-size: 22px;
        }

        .movieCard {
          width: 210px;
        }

        .poster {
          height: 120px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4b0f17, #121212);
          display: grid;
          place-items: center;
          text-align: center;
          font-size: 34px;
          font-weight: 950;
          color: white;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45);
        }

        .poster span {
          font-size: 17px;
          color: #ddd;
        }

        .movieCard p {
          margin: 10px 0 2px;
          font-weight: 800;
        }

        .movieCard small {
          color: #aaa;
        }
          /* ========================= */
        /* CLEAN IPHONE / MOBILE VERSION */
        /* ========================= */

        @media (max-width: 768px) {
          :global(html),
          :global(body) {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
            background: #000;
            overscroll-behavior: none;
          }

          .site,
          .carScene,
          .tvMode,
          .retroScreen,
          .pcPuzzleScreen {
            width: 100vw;
            height: 100svh;
            max-height: 100svh;
            overflow: hidden;
            touch-action: manipulation;
          }

          .roomImage {
            object-fit: cover;
            object-position: 54% center;
          }

          .logo {
            top: calc(env(safe-area-inset-top) + 20px);
            font-size: 26px;
            letter-spacing: 10px;
            z-index: 15;
          }

          .enter,
          .watch,
          .carExit {
            z-index: 20;
            backdrop-filter: blur(12px);
            background: rgba(0, 0, 0, 0.38);
          }

          .enter {
            left: 50%;
            right: auto;
            top: auto;
            bottom: calc(env(safe-area-inset-bottom) + 190px);
            transform: translateX(-50%);
            width: 104px;
            height: 104px;
            font-size: 20px;
          }

          .watch {
            left: auto;
            right: 10%;
            top: auto;
            bottom: calc(env(safe-area-inset-bottom) + 170px);
            transform: none;
            width: 94px;
            height: 94px;
            font-size: 19px;
          }

          .carExit {
            left: 8%;
            right: auto;
            top: auto;
            bottom: calc(env(safe-area-inset-bottom) + 130px);
            transform: none;
            width: 126px;
            height: 126px;
            font-size: 36px;
          }

          .carExit span {
            font-size: 13px;
          }

          .landingContent {
            width: calc(100vw - 30px);
            padding: 28px 20px;
            border-radius: 24px;
          }

          .landingContent h1 {
            font-size: 72px;
          }

          .landingText {
            font-size: 15px;
            line-height: 1.55;
          }

          .earlyAccessBox input,
          .earlyAccessBox button {
            height: 48px;
          }

          .blueScreen,
          .miniNetflix,
          .retroScreen {
            min-height: 100svh;
          }

          .movieBackRoom,
          .movieMenuButton,
          .tvBack,
          .puzzleBack,
          .glassBackRoom,
          .carInteriorBack,
          .carBack {
            top: calc(env(safe-area-inset-top) + 14px);
            padding: 10px 16px;
            font-size: 14px;
            border-radius: 999px;
            z-index: 100;
          }

          .miniTop {
            height: 80px;
            padding: calc(env(safe-area-inset-top) + 10px) 18px 0;
          }

          .miniLogo {
            display: none;
          }

          .movieMenuButton {
            right: 16px;
          }

          .heroMovie {
            min-height: 58svh;
            padding: calc(env(safe-area-inset-top) + 120px) 24px 42px;
          }

          .heroMovie h1 {
            font-size: 66px;
            letter-spacing: 0.04em;
          }

          .heroMovie h2 {
            font-size: 44px;
          }

          .movieDesc {
            width: 100%;
            max-width: 100%;
            font-size: 17px;
            line-height: 1.55;
          }

          .comingSoon {
            width: 180px;
            height: 58px;
            font-size: 18px;
          }

          .movieRow {
            padding: 28px 24px 130px;
          }

          .movieRow h3 {
            font-size: 36px;
          }

          .movieCard {
            width: 100%;
            max-width: 360px;
          }

          .poster {
            width: 100%;
            height: 150px;
          }

          .retroScreen {
            overflow: hidden;
          }

          .mainWindow {
            width: calc(100vw - 26px);
            height: 46svh;
            left: 13px;
            right: auto;
            top: calc(env(safe-area-inset-top) + 64px);
            transform: none;
            box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.28);
          }

          .desktopIcons {
            display: none;
          }

          .windowBody {
            padding: 20px 12px;
          }

          .driveGrid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .folderIcon {
            font-size: 38px;
          }

          .startMenu {
            width: 72vw;
            height: 250px;
            bottom: 44px;
          }

          .startItems button {
            font-size: 14px;
            padding: 6px 10px;
          }

          .taskbar {
            height: 44px;
            padding-bottom: env(safe-area-inset-bottom);
          }

          .startButton {
            width: 72px;
          }

          .taskButton {
            min-width: 130px;
          }

          .clock {
            min-width: 74px;
            font-size: 12px;
          }

          .folderWindow {
            width: calc(100vw - 28px);
            height: 42svh;
            left: 14px;
            top: 30svh;
            transform: none;
          }

          .carImage,
          .carInteriorImage {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          .carInteriorShade {
            background:
              linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.45)),
              radial-gradient(circle at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,0.22));
          }

          .enterCarHotspot {
            width: 112px;
            height: 112px;
            font-size: 16px;
          }

          .interactiveRadioPulse,
          .interactiveMapPulse {
            display: grid !important;
            place-items: center;
            position: fixed;
            top: auto;
            bottom: calc(env(safe-area-inset-bottom) + 24px);
            width: calc(50vw - 26px);
            height: 64px;
            border-radius: 18px;
            border: 1px solid rgba(130, 255, 130, 0.85);
            background:
              repeating-linear-gradient(to bottom, rgba(130,255,130,0.05) 0 1px, transparent 1px 4px),
              rgba(0, 30, 0, 0.74);
            color: #8cff8c;
            font-family: "Courier New", monospace;
            font-size: 20px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 0 24px rgba(130, 255, 130, 0.32);
            text-shadow: 0 0 10px rgba(130, 255, 130, 0.9);
            z-index: 70;
            animation: none;
          }

          .interactiveRadioPulse {
            left: 16px;
          }

          .interactiveMapPulse {
            right: 16px;
          }

          .radioPopup,
          .interactiveMapPanel {
            position: fixed;
            left: 16px;
            right: 16px;
            top: auto;
            bottom: calc(env(safe-area-inset-bottom) + 102px);
            width: auto;
            max-width: none;
            transform: none;
            z-index: 85;
            border-radius: 22px;
            padding: 18px;
            max-height: calc(100svh - 190px);
            overflow: auto;
          }

          .radioPopup {
            bottom: calc(env(safe-area-inset-bottom) + 102px);
          }

          .radioStation h1 {
            font-size: 68px;
          }

          .radioVisualizer {
            height: 56px;
            margin: 14px 0;
          }

          .songButtons {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .songChoice {
            height: 46px;
            font-size: 15px;
          }

          .interactiveMapPanel {
            min-height: 0;
          }

          .panelLabel {
            font-size: 22px;
            margin-bottom: 14px;
          }

          .animatedMiniMap {
            position: relative;
            top: auto;
            right: auto;
            left: auto;
            width: 100%;
            height: 210px;
            margin: 0 0 18px;
            border-radius: 18px;
          }

          .routeChoice {
            width: 100%;
            height: 62px;
            margin: 12px 0;
            border-radius: 14px;
            font-size: 18px;
            padding: 0 22px;
          }

          .routeLineSolid {
            stroke-width: 7;
          }

          .movingDot {
            fill: #ffffff;
          }

          .routeDotGlow {
            r: 7;
          }

          .oldTvShell {
            width: calc(100vw - 30px);
            height: 58svh;
            padding: 18px;
            border-radius: 24px;
          }

          .tvApp {
            width: 170px;
            height: 126px;
            font-size: 19px;
          }

          .passwordBox {
            width: calc(100vw - 32px);
            padding: 22px;
          }

          .passwordBox h1 {
            font-size: 24px;
          }

          .passwordBox small {
            font-size: 11px;
            line-height: 1.45;
          }

          .puzzleCard {
            width: calc(100vw - 28px);
            max-height: calc(100svh - 90px);
            padding: 22px 16px;
          }

          .mazeBoard {
            width: min(320px, 78vw);
          }

          .puzzleControls button {
            width: 54px;
            height: 44px;
          }
        }

      `}</style>
    </main>
  );
}
