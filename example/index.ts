import * as tts from '../src';
// @ts-ignore-next-line
import Worker from './worker.ts?worker';
let worker = new Worker(); // set worker so we can reuse it.

// required for e2e
Object.assign(window, { tts });

document.querySelector('#app')!.innerHTML = `
<button id="btn" type="button">Predict</button>
<select id="voices"></select>

<p>Stored Voices</p>
<ul id="stored">
</ul>
<button id="flush">Flush storage</button>
`

window.onload = () => {
  let selected = 'en_US-hfc_female-medium';
  const pickerEL = document.getElementById('voices');
  worker.postMessage({ type: 'voices' });
  worker.addEventListener('message', (event: MessageEvent<{ type: 'voices', voices: { key: string }[] }>) => {
    if (event.data.type != 'voices') return;
    for (let voice of event.data.voices) {
      let optionEl = document.createElement('option');
      if (selected === voice.key) optionEl.selected = true;
      optionEl.value = voice.key
      optionEl.label = voice.key
      pickerEL?.appendChild(optionEl)
    }
  });

  const listEl = document.getElementById('stored');
  worker.postMessage({ type: 'stored' });
  worker.addEventListener('message', (event: MessageEvent<{ type: 'stored', voiceIds: string[] }>) => {
    if (event.data.type != 'stored') return;
    for (let voice of event.data.voiceIds) {
      let liEl = document.createElement('li');
      liEl.innerText = voice
      listEl?.appendChild(liEl)
    }
  });
}


document.getElementById('flush')?.addEventListener('click', async () => {
  const mainWorker = worker ?? new Worker();
  mainWorker.postMessage({ type: 'flush' });
  setTimeout(() => { window.location.reload() }, 2_000)
});

document.getElementById('btn')?.addEventListener('click', async () => {
  const mainWorker = worker ?? new Worker();
  mainWorker.postMessage({
    type: 'init',
    text: "As the waves crashed against the shore, they carried tales of distant lands and adventures untold.",
    // @ts-ignore-next-line
    voiceId: document.getElementById('voices')?.value ?? 'en_US-hfc_female-medium',
  });
});

// Listen for messages over and over on this index.
worker.addEventListener('message', (event: MessageEvent<{ type: 'result', audio: Blob } | { type: 'error', message: string }>) => {
  console.log(event)
  if (event.data.type === 'error') return console.error(event.data.message);
  if (event.data.type != 'result') return;

  const audio = new Audio();
  audio.src = URL.createObjectURL(event.data.audio);
  audio.play();
});
