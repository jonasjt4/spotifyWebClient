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
        String.fromCharCode(
            ...new Uint8Array(input)
        )
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


// ==========================================
// LOGIN
// ==========================================

loginBtn.addEventListener(
    "click",
    async function () {

        try {

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


            const params =
                new URLSearchParams();

            params.set(
                "client_id",
                CLIENT_ID
            );

            params.set(
                "response_type",
                "code"
            );

            params.set(
                "redirect_uri",
                REDIRECT_URI
            );

            params.set(
                "scope",
                SCOPES
            );

            params.set(
                "code_challenge_method",
                "S256"
            );

            params.set(
                "code_challenge",
                challenge
            );


            window.location.href =
                "https://accounts.spotify.com/authorize?" +
                params.toString();

        }
        catch (error) {

            console.error(
                "Login error:",
                error
            );

            status.textContent =
                "Login error";

        }

    }
);


// ==========================================
// HANDLE LOGIN CALLBACK
// ==========================================

async function handleCallback() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const code =
        params.get("code");

    const error =
        params.get("error");


    if (error) {

        console.error(
            "Spotify authorization error:",
            error
        );

        status.textContent =
            "Spotify login cancelled";

        return;
    }


    if (!code) {

        const existingToken =
            localStorage.getItem(
                "spotify_access_token"
            );

        if (existingToken) {

            loginBtn.textContent =
                "Connected";

            status.textContent =
                "Connected";

            await updatePlayer();

            setInterval(
                updatePlayer,
                3000
            );

        }

        return;
    }


    const verifier =
        localStorage.getItem(
            "spotify_verifier"
        );


    if (!verifier) {

        console.error(
            "Spotify verifier missing."
        );

        status.textContent =
            "Login error";

        return;
    }


    try {

        const body =
            new URLSearchParams();

        body.set(
            "client_id",
            CLIENT_ID
        );

        body.set(
            "grant_type",
            "authorization_code"
        );

        body.set(
            "code",
            code
        );

        body.set(
            "redirect_uri",
            REDIRECT_URI
        );

        body.set(
            "code_verifier",
            verifier
        );


        const response =
            await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body: body.toString()
                }
            );


        const data =
            await response.json();


        if (data.access_token) {

            localStorage.setItem(
                "spotify_access_token",
                data.access_token
            );


            if (data.refresh_token) {

                localStorage.setItem(
                    "spotify_refresh_token",
                    data.refresh_token
                );

            }


            localStorage.removeItem(
                "spotify_verifier"
            );


            window.history.replaceState(
                {},
                document.title,
                REDIRECT_URI
            );


            loginBtn.textContent =
                "Connected";

            status.textContent =
                "Connected";


            await updatePlayer();


            setInterval(
                updatePlayer,
                3000
            );

        }
        else {

            console.error(
                "Spotify token error:",
                data
            );

            status.textContent =
                "Login failed";

        }

    }
    catch (error) {

        console.error(
            "Token request error:",
            error
        );

        status.textContent =
            "Connection error";

    }

}


// ==========================================
// GET ACCESS TOKEN
// ==========================================

function getToken() {

    return localStorage.getItem(
        "spotify_access_token"
    );

}


// ==========================================
// SPOTIFY API REQUEST
// ==========================================

async function spotifyRequest(
    endpoint,
    options
) {

    const token =
        getToken();


    if (!token) {

        console.log(
            "Not logged into Spotify."
        );

        return null;
    }


    try {

        const requestOptions =
            options || {};


        const headers =
            requestOptions.headers || {};


        const response =
            await fetch(
                "https://api.spotify.com/v1" + endpoint,
                {
                    ...requestOptions,

                    headers: {
                        ...headers,

                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        if (response.status === 204) {

            return true;

        }


        if (!response.ok) {

            console.error(
                "Spotify API error:",
                response.status
            );

            return null;
        }


        return await response.json();

    }
    catch (error) {

        console.error(
            "Spotify request error:",
            error
        );

        return null;

    }

}


// ==========================================
// GET CURRENT PLAYBACK
// ==========================================

async function updatePlayer() {

    const data =
        await spotifyRequest(
            "/me/player"
        );


    if (!data) {

        return;
    }


    if (!data.item) {

        songTitle.textContent =
            "Nothing playing";

        artistName.textContent =
            "Spotify is not playing";

        deviceName.textContent =
            "No device";

        return;
    }


    const track =
        data.item;


    songTitle.textContent =
        track.name;


    artistName.textContent =
        track.artists
            .map(
                function (artist) {
                    return artist.name;
                }
            )
            .join(", ");


    if (
        track.album &&
        track.album.images &&
        track.album.images.length > 0
    ) {

        albumArt.src =
            track.album.images[0].url;

    }


    currentTime.textContent =
        formatTime(
            data.progress_ms || 0
        );


    duration.textContent =
        formatTime(
            track.duration_ms || 0
        );


    progress.max =
        track.duration_ms || 0;


    progress.value =
        data.progress_ms || 0;


    if (data.is_playing) {

        playBtn.textContent =
            "❚❚";

    }
    else {

        playBtn.textContent =
            "▶";

    }


    if (data.device) {

        deviceName.textContent =
            data.device.name;

    }
    else {

        deviceName.textContent =
            "No device";

    }


    status.textContent =
        "Connected";

}


// ==========================================
// PLAY / PAUSE
// ==========================================

playBtn.addEventListener(
    "click",
    async function () {

        const data =
            await spotifyRequest(
                "/me/player"
            );


        if (!data) {

            return;
        }


        if (data.is_playing) {

            await spotifyRequest(
                "/me/player/pause",
                {
                    method: "PUT"
                }
            );

        }
        else {

            await spotifyRequest(
                "/me/player/play",
                {
                    method: "PUT"
                }
            );

        }


        setTimeout(
            updatePlayer,
            500
        );

    }
);


// ==========================================
// NEXT
// ==========================================

nextBtn.addEventListener(
    "click",
    async function () {

        await spotifyRequest(
            "/me/player/next",
            {
                method: "POST"
            }
        );


        setTimeout(
            updatePlayer,
            500
        );

    }
);


// ==========================================
// PREVIOUS
// ==========================================

previousBtn.addEventListener(
    "click",
    async function () {

        await spotifyRequest(
            "/me/player/previous",
            {
                method: "POST"
            }
        );


        setTimeout(
            updatePlayer,
            500
        );

    }
);


// ==========================================
// VOLUME
// ==========================================

volume.addEventListener(
    "change",
    async function () {

        const value =
            Number(volume.value);


        const endpoint =
            "/me/player/volume?volume_percent=" +
            value;


        await spotifyRequest(
            endpoint,
            {
                method: "PUT"
            }
        );

    }
);


// ==========================================
// SEEK
// ==========================================

progress.addEventListener(
    "change",
    async function () {

        const position =
            Number(progress.value);


        const endpoint =
            "/me/player/seek?position_ms=" +
            position;


        await spotifyRequest(
            endpoint,
            {
                method: "PUT"
            }
        );


        updatePlayer();

    }
);


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code === "Space" &&
            event.target.tagName !== "INPUT"
        ) {

            event.preventDefault();

            playBtn.click();

        }


        if (
            event.code === "ArrowRight"
        ) {

            nextBtn.click();

        }


        if (
            event.code === "ArrowLeft"
        ) {

            previousBtn.click();

        }

    }
);


// ==========================================
// TIME FORMAT
// ==========================================

function formatTime(milliseconds) {

    const totalSeconds =
        Math.floor(
            milliseconds / 1000
        );


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    return (
        minutes +
        ":" +
        seconds
            .toString()
            .padStart(2, "0")
    );

}


// ==========================================
// START APP
// ==========================================

handleCallback();
