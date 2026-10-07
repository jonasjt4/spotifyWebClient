```javascript
// ==========================================
// SPOTIFY CONFIG
// ==========================================

const CLIENT_ID = "4b1b166a0db94530923fa6e20f38d3ba";

const REDIRECT_URI =
    "https://jonasjt4.github.io/spotifyWebClient/";


// ==========================================
// SPOTIFY PERMISSIONS
// ==========================================

const SCOPES = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-private"
].join(" ");


// ==========================================
// ELEMENTS
// ==========================================

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


// ==========================================
// PKCE
// ==========================================

function generateRandomString(length) {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return result;
}


async function sha256(plain) {

    const encoder = new TextEncoder();

    const data = encoder.encode(plain);

    return window.crypto.subtle.digest(
        "SHA-256",
        data
    );
}


function base64urlencode(input) {

    return btoa(
        String.fromCharCode(...new Uint8Array(input))
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


// ==========================================
// LOGIN
// ==========================================

loginBtn.addEventListener("click", async () => {

    const verifier =
        generateRandomString(128);

    const hashed =
        await sha256(verifier);

    const challenge =
        base64urlencode(hashed);


    localStorage.setItem(
        "spotify_verifier",
        verifier
    );


    const params = new URLSearchParams({

        client_id: CLIENT_ID,

        response_type: "code",

        redirect_uri: REDIRECT_URI,

        scope: SCOPES,

        code_challenge_method: "S256"
```
