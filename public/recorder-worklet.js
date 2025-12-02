class RecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunks = [];
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const samples = input[0];
      this.port.postMessage(samples);
    }
    return true;
  }
}

registerProcessor("recorder-worklet", RecorderWorklet);
