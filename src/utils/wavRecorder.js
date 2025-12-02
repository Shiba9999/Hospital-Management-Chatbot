export class WavRecorder {
  constructor() {
    this.chunks = [];
    this.sampleRate = 16000; // Azure requirement
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new AudioContext({ sampleRate: this.sampleRate });
    this.source = this.context.createMediaStreamSource(this.stream);

    const processor = this.context.createScriptProcessor(4096, 1, 1);
    this.source.connect(processor);
    processor.connect(this.context.destination);

    processor.onaudioprocess = (e) => {
      this.chunks.push(e.inputBuffer.getChannelData(0));
    };

    this.processor = processor;
  }

  stop() {
    this.processor.disconnect();
    this.source.disconnect();
    this.stream.getTracks().forEach((t) => t.stop());

    return this.exportWav();
  }

  exportWav() {
    const pcm = this.flatten(this.chunks);
    const buffer = this.encodeWav(pcm);

    return new File([buffer], "recording.wav", { type: "audio/wav" });
  }

  flatten(chunks) {
    const length = chunks.reduce((a, b) => a + b.length, 0);
    const data = new Float32Array(length);
    let offset = 0;
    for (let chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data;
  }

  encodeWav(samples) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");

    writeString(12, "fmt ");
    view.setUint32(16, 16, true); // PCM
    view.setUint16(20, 1, true); // Linear PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    // PCM Samples
    let offset = 44;
    for (let sample of samples) {
      let s = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }

    return buffer;
  }
}
