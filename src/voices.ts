import { HF_BASE } from "./fixtures";
import { Voice } from "./types";

/**
 * Retrieves all available voices from huggingface and falls back to local cache.
 * @returns 
 */
export async function voices(): Promise<Voice[]> {
  try {
    const res = await fetch(`${HF_BASE}/voices.json`);
    if (!res.ok) throw new Error('Could not retrieve voices file from huggingface');
    return Object.values(await res.json());
  } catch {
    const LOCAL_VOICES_JSON = await import('./voices_static.json');
    console.log(`Could not fetch voices.json remote ${HF_BASE}. Fetching local`);
    return Object.values(LOCAL_VOICES_JSON.default);
  }
}