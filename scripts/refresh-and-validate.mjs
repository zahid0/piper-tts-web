import { HF_BASE, PATH_MAP } from '../dist/piper-tts-web.js'
import STATIC from '../src/voices_static.json' assert { type: "json" };
import deepCompare from 'object-deep-compare'

(async () => {
  try {
    const remoteJSON = await fetch(`${HF_BASE}/voices.json`)
      .then((res) => res.json());

    const comparison = deepCompare.CompareProperties(STATIC, remoteJSON);
    if (comparison.differences.length !== 0) {
      console.log(`Differences detected between our stored and the remote JSON. Exiting early. Refresh static from ${HF_BASE}/voices.json.`);
      console.log(comparison);
      return;
    }

    console.log(`PATH_MAP has ${Object.keys(PATH_MAP).length} keys. We currently have ${Object.keys(remoteJSON).length} keys.`)
    if (Object.keys(PATH_MAP).length === Object.keys(remoteJSON).length) return console.log("No keys are missing. We are up to date!")

    const toAdd = {};
    console.log("We are missing keys in PATH_MAP. Iterating...");
    for (const key of Object.keys(remoteJSON)) {
      if (PATH_MAP.hasOwnProperty(key)) continue;
      console.log(`PATH_MAP missing ${key}`);
      const lang = key.split('_', 1)[0];
      toAdd[key] = `${lang}/${key.replaceAll('-', '/')}/${key}.onnx`;
    }

    console.log('Add the following records to the end of PATH_MAP object in ./fixtures.ts');
    console.log(toAdd);
  } catch (e) {
    console.error(e)
  } finally { return; }
})();