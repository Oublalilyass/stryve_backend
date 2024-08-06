// public/js/sessionManager.js
import { addText, getAllTexts, getTextsBySession } from './indexedDB';

let currentSession = 'Writer'; // Default session

export const switchSession = (sessionType) => {
  currentSession = sessionType;
  document.cookie = `sessionType=${sessionType}`;
  displayTexts();
};

export const uploadText = async (text) => {
  await addText({ content: text, sessionType: currentSession });
  displayTexts();
};

const displayTexts = async () => {
  const texts = await getTextsBySession(currentSession);
};

// Call displayTexts on page load to display texts for the current session
document.addEventListener('DOMContentLoaded', displayTexts);
