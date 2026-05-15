// public/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input[0]) {
      const channelData = input[0];
      
      // Convert Float32 to Int16
      const buffer = new ArrayBuffer(channelData.length * 2);
      const view = new DataView(buffer);
      
      for (let i = 0; i < channelData.length; i++) {
        let sample = Math.max(-1, Math.min(1, channelData[i]));
        let int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(i * 2, int16, true);
      }
      
      // Send to main thread
      this.port.postMessage(buffer);
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);