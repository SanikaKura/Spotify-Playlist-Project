//import express from 'C:\Users\sanik\spotify-playlist-project\node_modules\express';
//import fetch from 'node-fetch';

const clientId = '-';
const clientSecret = '-';
const redirectUri = 'http://localhost:3000/callback'; // Ensure this matches your registered redirect URI
const scopes = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
const AUTH = "https://accounts.spotify.com/authorize";


const imageEl1 = document.getElementById('imageid1');
imageEl1.hidden = true;
const imageEl2 = document.getElementById('imageid2');
imageEl2.hidden = true;
const imageEl3 = document.getElementById('imageid3');
imageEl3.hidden = true;
const imageEl4 = document.getElementById('imageid4');
imageEl4.hidden = true;
const header = document.getElementById('heading');
header.hidden = true;

function authorize(){
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true`;
    window.location.href = authUrl;
}

function onPageLoad() {
    if (window.location.hash.length > 0) {
        //handleRedirect();
        let access = getAccessToken();
        if (access){
            window.history.pushState("","", redirectUri);
            create(access);
        } else {console.log('no access tok found');}
    }
    else {console.log('no hash in url');}
}

function getAccessToken() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessTok = params.get('access_token');
    return accessTok;
}

async function create(access){
    let userdata = await getUserInfo(access);
    let id = userdata.id;

    getTopTracks(access, id);
}

async function createPlaylist(accessToken, userId, tracks, tracks2, tracks3) {

    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {//making the playlist
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'made for you',
            description: 'Playlist based on your top tracks',
            public: false
        })
    });
    const playlist = await response.json();
    showArt(top10);

    // making playlist here
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {//adding first 10 songs
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: tracks.map(tracks => tracks.uri)
        })

    });

    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {//adding 5 more songs
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: tracks2.map(tracks2 => tracks2.uri)
        })
    });

    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {//adding 5 more songs
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: tracks3.map(tracks3 => tracks3.uri)
        })
    });
}

function showArt(top10){
    const topsong1 = top10.items[0];
    const topsong2 = top10.items[1];
    const topsong3 = top10.items[2];
    const topsong4 = top10.items[3];

    const image1 = topsong1.album?.images?.[1]?.url;
    const image2 = topsong2.album?.images?.[1]?.url;
    const image3 = topsong3.album?.images?.[1]?.url;
    const image4 = topsong4.album?.images?.[1]?.url;

    document.getElementById('imageid1').src = image1;
    imageEl1.hidden = false;
    document.getElementById('imageid2').src = image2;
    imageEl2.hidden = false;
    document.getElementById('imageid3').src = image3;
    imageEl3.hidden = false;
    document.getElementById('imageid4').src = image4;
    imageEl4.hidden = false;
    header.hidden = false;
}

async function getUserInfo(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json()
    //console.log('userinfo', data);
    return data;
}

async function getTopTracks(accessToken, userID) {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const top10 = await response.json()//getting top 10 songs

    const response1 = await fetch(`https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${top10.items[0].id, top10.items[1].id}&max_popularity=60&target_valence=.7`, { //getting 10 recs from tracks 1+2
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    let recs1 = await response1.json()

    const response2 = await fetch(`https://api.spotify.com/v1/recommendations?limit=5&seed_tracks=${top10.items[2].id, top10.items[3].id}&max_popularity=60&min_valence=.65`, {//5 more recs
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const recs2 = await response2.json()

    const response3 = await fetch(`https://api.spotify.com/v1/recommendations?limit=5&seed_tracks=${top10.items[4].id, top10.items[5].id}&max_popularity=60`, {//more recs
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const recs3 = await response3.json()
    //recs1 = recs1 + recs2;
    //const allRecs= []
    createPlaylist(accessToken, userID, recs1.tracks, recs2.tracks, recs3.tracks, top10);

}

async function main() {
    document.getElementById('login-button').addEventListener('click', authorize);
    onPageLoad();
}

main();
