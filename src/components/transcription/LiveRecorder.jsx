import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import useSocket from '../../hooks/useSocket';
import { setIsRecording } from '../../features/transcription/transcriptionSlice';

export default function LiveRecorder() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { isRecording, loadingStatus } = useSelector((state) => state.transcription);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000 },
    });
    
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const int16Data = floatTo16BitPCM(inputData);
      socket?.emit('audio_chunk', int16Data);
    };
    
    dispatch(setIsRecording(true));
  };

  const stopRecording = () => {
    socket?.emit('stop_recording');
    dispatch(setIsRecording(false));
  };

  const floatTo16BitPCM = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      {isRecording ? (
        <>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<Stop />}
            onClick={stopRecording}
            sx={{ mb: 2 }}
          >
            Stop Recording
          </Button>
          <Typography variant="body2" color="text.secondary">
            {loadingStatus || 'Recording...'}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </>
      ) : (
        <Button
          variant="contained"
          size="large"
          startIcon={<Mic />}
          onClick={startRecording}
        >
          Start Live Recording
        </Button>
      )}
    </Box>
  );
}