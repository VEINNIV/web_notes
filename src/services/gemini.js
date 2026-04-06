/**
 * gemini.js — Google Gemini API integration
 *
 * Provides three AI operations for a selected note:
 *  1. summarize  — Condenses the note into 2-3 bullet points
 *  2. quiz       — Generates 3 short-answer questions to test recall
 *  3. expand     — Adds relevant detail to deepen the note content
 *
 * The API key is read from localStorage each time so the user can
 * update it in Settings without reloading the page.
 *
 * Uses gemini-2.0-flash — fastest model, free tier friendly.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/** Retrieve the stored API key from localStorage. */
const getApiKey = () => localStorage.getItem('noteflow_gemini_key') || '';

/**
 * Build a text representation of a note for the AI prompt.
 * Includes the title, body, and any checklist items.
 *
 * @param {Object} note
 * @returns {string}
 */
function buildNoteText(note) {
  const lines = [];
  if (note.title) lines.push(`Title: ${note.title}`);
  if (note.content) lines.push(`Content:\n${note.content}`);
  if (note.checklist?.length) {
    const items = note.checklist
      .map((item) => `  [${item.done ? 'x' : ' '}] ${item.text}`)
      .join('\n');
    lines.push(`Checklist:\n${items}`);
  }
  if (note.tags?.length) lines.push(`Tags: ${note.tags.join(', ')}`);
  return lines.join('\n\n');
}

/**
 * Core function — sends a prompt to Gemini and returns the text response.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 * @throws {Error} if no API key or the API call fails
 */
async function callGemini(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please add it in Settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Summarize a note into 2-3 concise bullet points.
 *
 * @param {Object} note - The note object from the DB
 * @returns {Promise<string>}
 */
export async function summarizeNote(note) {
  const noteText = buildNoteText(note);
  const prompt = `Summarize the following note into 2-3 clear, concise bullet points. 
Be direct and factual. Output only the bullets, no intro text.

---
${noteText}
---`;
  return callGemini(prompt);
}

/**
 * Generate 3 short-answer quiz questions based on the note content.
 *
 * @param {Object} note - The note object from the DB
 * @returns {Promise<string>}
 */
export async function quizNote(note) {
  const noteText = buildNoteText(note);
  const prompt = `Based on the following note, generate exactly 3 short-answer questions 
to help someone test their understanding of the material.
Format each question as: "Q1: ..." on its own line.
Do not include answers.

---
${noteText}
---`;
  return callGemini(prompt);
}

/**
 * Expand the note with additional relevant context or details.
 *
 * @param {Object} note - The note object from the DB
 * @returns {Promise<string>}
 */
export async function expandNote(note) {
  const noteText = buildNoteText(note);
  const prompt = `The following is a personal note. Add 2-3 paragraphs of useful, 
relevant context or detail that would enhance understanding of this topic.
Be informative but concise. Do not repeat what is already written.

---
${noteText}
---`;
  return callGemini(prompt);
}
