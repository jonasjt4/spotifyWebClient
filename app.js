```javascript
/*
    Minimal Spotify Remote
    ----------------------

    This is the frontend controller.

    Spotify API authentication and playback
    functions will be connected here.
*/


// -----------------------------------------
// Elements
// -----------------------------------------

const loginBtn = document.getElementById("loginBtn");

const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const albumArt = document.getElementById("albumArt");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");

const deviceName = document.getElementById("deviceName");
const status = document.getElementById("status");


// -----------------------------------------
// Login
// -----------------------------------------

loginBtn.addEventListener("click", () => {

    /*
        Spotify authentication will go here.

        Later this will use Spotify OAuth + PKCE.
    */

    alert(
        "Spotify login will be connected here."
    );

});


// -----------------------------------------
// Play / Pause
// -----------------------------------------

playBtn.addEventListener("click", async () => {

    /*
        Later:

        If Spotify is playing:
            pauseSpotify();

        Otherwise:
            playSpotify();
    */

    console.log("Play / pause");

});


// -----------------------------------------
// Previous
// -----------------------------------------

previousBtn.addEventListener("click", async () => {

    console.log("Previous track");

});


// -----------------------------------------
// Next
// -----------------------------------------

nextBtn.addEventListener("click", async () => {

    console.log("Next track");

});


// -----------------------------------------
// Volume
// -----------------------------------------

volume.addEventListener("input", async () => {

    const value = volume.value;

    console.log("Volume:", value);

    /*
        Later:

        Spotify API:
        PUT /me/player/volume

        volume_percent = value
    */

});


// -----------------------------------------
// Progress bar
// -----------------------------------------

progress.addEventListener("input", () => {

    const value = progress.value;

    console.log("Seek:", value);

    /*
        Later this will send:

        PUT /me/player/seek

        position_ms = ...
    */

});


// -----------------------------------------
// Keyboard controls
// -----------------------------------------

document.addEventListener("keydown", (event) => {

    // Space = play/pause
    if (event.code === "Space") {

        event.preventDefault();

        playBtn.click();
    }


    // Left arrow = previous
    if (event.code === "ArrowLeft") {

        previousBtn.click();
    }


    // Right arrow = next
    if (event.code === "ArrowRight") {

        nextBtn.click();
    }

});


// -----------------------------------------
// Helpers
// -----------------------------------------

function formatTime(milliseconds) {

    const totalSeconds =
        Math.floor(milliseconds / 1000);

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    return `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
}


// -----------------------------------------
// Demo data
// -----------------------------------------

function demoSong() {

    songTitle.textContent = "Nothing playing";

    artistName.textContent =
        "Connect Spotify to begin";

    currentTime.textContent = "0:00";

    duration.textContent = "0:00";

    progress.value = 0;

    deviceName.textContent =
        "No device connected";

    status.textContent =
        "Disconnected";
}


// Start
demoSong();
```

