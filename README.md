### Version
```
Node 7.x
NPM 5.6.x
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
export ALLOWED_EMAILS=your_email@gmail.com
export GOOGLE_CLIENT_ID=503261721333-g6i3ure3k7inhgkopg84vlis8jpmaavv.apps.googleusercontent.com
export GOOGLE_CLIENT_SECRET=2TghLXyQ8pibFOrNTC6kKLY4
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

### User setup
* Google Developer Console Access
* Create New App and Get The Client Id, Client Secret
* Set Redirect URL `${APP.API_URL}/api/v1/user/register/oauth/callback`
