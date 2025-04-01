# Bandwidth Checker and Video Recorder

An application for checking internet bandwidth and recording webcam video with automatic quality selection.

## Features

- Automatic internet bandwidth measurement
- Webcam video recording in three quality levels (360p, 720p, 1080p)
- Automatic recording quality selection based on measured bandwidth
- Manual quality selection option
- Saved video storage
- Playback and deletion of saved videos
- Video persistence after page refresh

## Installation and Launch

1. Clone the repository:
```bash
git clone https://github.com/vikulchik/bandwidth-checker.git
cd bandwidth-checker
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## Tech Stack

- Angular 15
- NGXS for state management
- Angular Material for UI components
- MediaRecorder API for video recording
- IndexedDB for video storage

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── webcam-recorder/
│   │   └── video-list/
|   |   |__ delete-dialog/
│   ├── services/
│   │   ├── bandwidth.service.ts
│   │   ├── storage.service.ts
│   │   └── video.service.ts
|   |   |__ video-storage.service.ts
|   |   |__ webcam.service.ts
│   ├── store/
│   │   ├── actions/
│   │   ├── models/
│   │   └── state/
│   └── models/
└── assets/
```

## Video Storage Approach

The application uses IndexedDB for storing recorded videos. This approach was chosen for the following reasons:

1. **Large Data Volume**: Unlike localStorage, IndexedDB allows storing significantly larger amounts of data.

2. **Binary Data Support**: IndexedDB works excellently with Blob and ArrayBuffer, making it ideal for video file storage.

3. **Asynchronous Operations**: IndexedDB provides an asynchronous API, which doesn't block the main thread when handling large files.

4. **Persistence**: Data persists between browser sessions and remains available after page refresh.

Storage structure:
- Each video is stored as a separate record in the `videos` store
- Metadata (creation date, duration) is stored alongside the video file
- Automatic cleanup of old recordings when storage limit is exceeded

## Screenshots

### Initial Screen
<img width="1400" alt="Снимок экрана 2025-04-01 в 14 37 54" src="https://github.com/user-attachments/assets/46d6c253-5ccd-4b36-b64f-1c3da9debd25" />

### Recording Screen
<img width="1154" alt="Снимок экрана 2025-04-01 в 10 34 54" src="https://github.com/user-attachments/assets/e00d9f18-23ad-4e56-b546-f44b0f23c1d0" />

### Saved Videos List
<img width="1125" alt="Снимок экрана 2025-04-01 в 10 55 37" src="https://github.com/user-attachments/assets/2f75d061-afd2-40fe-8875-9a3504543f85" />

### Delete Dialog
<img width="1725" alt="Снимок экрана 2025-04-01 в 15 17 09" src="https://github.com/user-attachments/assets/0467abcf-c0d7-4d84-a21a-03ae9fafeb61" />

## Error Handling

The application handles the following situations:
- Webcam access denial
- Bandwidth measurement errors
- Video recording/saving errors
- Video playback errors

When errors occur, users are shown informative messages with possible actions to resolve the issue.

## Limitations

- Maximum recording duration: 10 seconds
- Supported browsers: Chrome, Firefox, Edge (latest versions)
- MediaRecorder API support required
- Webcam and microphone access permission required

## Future Improvements

- [ ] Add video trimming capability
- [ ] Preview in different resolutions
- [ ] Export videos in various formats
- [ ] Add filters and effects
- [ ] Optimize video compression 
