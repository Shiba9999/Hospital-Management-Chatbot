export class WavRecorder {
  constructor() {
    this.sampleRate = 16000;
    this.chunks = [];
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.context = new AudioContext({ sampleRate: this.sampleRate });

    await this.context.audioWorklet.addModule("/recorder-worklet.js");

    this.workletNode = new AudioWorkletNode(this.context, "recorder-worklet");

    this.source = this.context.createMediaStreamSource(this.stream);
    this.source.connect(this.workletNode);

    this.workletNode.port.onmessage = (event) => {
      this.chunks.push(event.data.slice());
    };
  }

  stop() {
    return new Promise((resolve) => {
      this.stream.getTracks().forEach((t) => t.stop());
      this.source.disconnect();
      this.workletNode.disconnect();

      resolve(this.exportWav());
    });
  }

  exportWav() {
    const samples = this.mergeChunks(this.chunks);
    const buffer = this.encodeWav(samples);
    return new File([buffer], "recording.wav", { type: "audio/wav" });
  }

  mergeChunks(chunks) {
    const length = chunks.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Float32Array(length);

    let offset = 0;
    for (let chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  encodeWav(samples) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++)
        view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");

    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }

    return buffer;
  }
}
