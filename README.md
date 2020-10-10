### Version
```
Node 10.16.3
NPM 6.9.0
```

### Installation
```
npm install
npm install nodemon -g
npm install ts-node -g
```

### Debugging
```
export DEBUG=PL:*
```

### Export variables
```
export DEBUG=PL:*
export SANDBOX='false'
export PORT=3007
export CRONE_JOB_ACTION='EXECUTE'
export API_URL=http://localhost:3007
export FFPROBE_PATH=./node_modules/ffmpeg-binaries/bin/ffmpeg
export DOWNLOAD_AUDIO_CONCURRENCY=1;
export DOWNLOAD_VIDEO_CONCURRENCY=1;
export LC_ALL=en_US.UTF-8
export GOOGLE_CLIENT_ID=YourClientId
export GOOGLE_CLIENT_SECRET=YourClientSecret
export MONGO_URL=mongodb://yourmongo/playit-dev
```

### Run the Application (Development Purpose Only)
```
npm start
```

### Prepare build
```
npm run build
```

### Run the Application (Production Purpose Only)
```
npm run build
node dist/src/server.js
```

### Verify Version
```
./node_modules/youtube-dl/bin/youtube-dl --version
```

### References
```
https://askubuntu.com/a/807918
```

### Required Setup
* MongoDB
* Google OAuth App
* Heroku Account to Deploy your App

### User setup
* Google Developer Console Access
* Create New App and Get The Client Id, Client Secret
* Set Redirect URL `${APP.API_URL}/api/v1/user/register/oauth/callback`

### Enable Below API Services in Your Google Developer Console
* Google Drive API
* People API
* YouTube Data API v3

### Other Important APIs
* Add User (Login as Google) `{{url}}/api/v1/user/register`
* Add the Audio/Video Playlist `{{url}}/api/v1/playlist`
* Remove Audio/Video Playlist `{{url}}/api/v1/playlist`

### Postman Collection to Quick Start Using APIs
`https://www.getpostman.com/collections/de711239ba8581682a33`