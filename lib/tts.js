/**
 * Text-to-Speech utility for American English
 * @param {string} text - The text to speak
 */
export const speak = (text) => {
  if (typeof window === 'undefined') return;
  
  const synth = window.speechSynthesis;
  
  // Cancel any ongoing speech
  synth.cancel();
  
  const loadVoices = () => {
    const voices = synth.getVoices();
    const americanVoice = voices.find(v => v.lang === "en-US");
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9; // Slightly slower for learning
    utter.pitch = 1;
    
    if (americanVoice) {
      utter.voice = americanVoice;
    }
    
    synth.speak(utter);
  };
  
  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = loadVoices;
  } else {
    loadVoices();
  }
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
};
