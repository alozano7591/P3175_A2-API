/** 
* By: Alfredo Lozano
* Assignment 2
* Distributed Applications
*/

const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

// Greetings
const GreetingRequest = require('./models/GreetingRequest');
const GreetingResponse = require('./models/GreetingResponse');
const { time } = require('console');

const app = express();
const PORT = 3000;

app.use(express.json());

// Open the SQLite database
let db;
(async () => {
  db = await sqlite.open({
    filename: './data/database.db',
    driver: sqlite3.Database
  });

  // Create a 'greetings' table if it doesn't exist.
  // I also opted to force timeOfDay + language + tone to be unique since 
  // gets should only return one greeting of the combo
  await db.exec(`
    CREATE TABLE IF NOT EXISTS greetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timeOfDay TEXT NOT NULL,
        language TEXT NOT NULL,
        greetingMessage TEXT NOT NULL,
        tone TEXT NOT NULL,
        UNIQUE(timeOfDay, language, tone)
    )
  `);

  const greetingsSeedData = [
    //mornings
    { timeOfDay: 'morning', language: 'english', greetingMessage: 'good morning', tone: 'formal' },
    { timeOfDay: 'morning', language: 'english', greetingMessage: 'morning', tone: 'casual' },
    { timeOfDay: 'morning', language: 'french', greetingMessage: 'bonjour', tone: 'formal' },
    { timeOfDay: 'morning', language: 'french', greetingMessage: 'coucou', tone: 'casual' },
    { timeOfDay: 'morning', language: 'spanish', greetingMessage: 'buenos días', tone: 'formal' },
    { timeOfDay: 'morning', language: 'spanish', greetingMessage: 'buen día', tone: 'casual' },

    //afternoons
    { timeOfDay: 'afternoon', language: 'english', greetingMessage: 'good afternoon', tone: 'formal' },
    { timeOfDay: 'afternoon', language: 'english', greetingMessage: 'afternoon', tone: 'casual' },
    { timeOfDay: 'afternoon', language: 'french', greetingMessage: 'bon après-midi', tone: 'formal' },
    { timeOfDay: 'afternoon', language: 'french', greetingMessage: 'bon aprèm', tone: 'casual' },
    { timeOfDay: 'afternoon', language: 'spanish', greetingMessage: 'buenas tardes', tone: 'formal' },
    { timeOfDay: 'afternoon', language: 'spanish', greetingMessage: 'hola', tone: 'casual' },

    //evenings
    { timeOfDay: 'evening', language: 'english', greetingMessage: 'good evening', tone: 'formal' },
    { timeOfDay: 'evening', language: 'english', greetingMessage: 'oi!', tone: 'casual' },
    { timeOfDay: 'evening', language: 'french', greetingMessage: 'bonne soirée', tone: 'formal' },
    { timeOfDay: 'evening', language: 'french', greetingMessage: 'salut', tone: 'casual' },
    { timeOfDay: 'evening', language: 'spanish', greetingMessage: 'buenas noches', tone: 'formal' },
    { timeOfDay: 'evening', language: 'spanish', greetingMessage: 'que tal', tone: 'casual' },

  ];

  for({timeOfDay, language, greetingMessage, tone} of greetingsSeedData){
    const result = await db.run(
        `INSERT OR IGNORE INTO greetings (timeOfDay, language, greetingMessage, tone) VALUES (?, ?, ?, ?)`,
        [timeOfDay, language, greetingMessage, tone]
    );

    // If any changes are detected then let us know which ID was added
    if(result.changes) console.log(`Inserted row with ID: ${result.lastID}`);

  }

})();

// Get a greeting
app.post('/api/greet', async (req, res) => {
  const { timeOfDay, language, tone } = req.body;

  if (!timeOfDay || !language || !tone) {
    return res.status(400).json({
      error: 'Hello user, time of day, language, and tone are required.',
    });
  }

  try {
    const greetingRequest = new GreetingRequest(timeOfDay.toLowerCase(), language.toLowerCase(), tone.toLowerCase());

    //I wasn't sure how specific the error messages need to be, 
    //but just in case I added checks for each column that is submitted
    //probably very efficient doing a db call for each on but wasn't sure how else to check
    const timeOfDayInDb = await db.get(`SELECT DISTINCT timeOfDay FROM greetings WHERE timeOfDay = '${greetingRequest.timeOfDay}'`);
    if(!timeOfDayInDb) throw new Error(`The following TimeOfDay is invalid: ${greetingRequest.timeOfDay}`);

    const languageInDb = await db.get(`SELECT DISTINCT language FROM greetings WHERE language = '${greetingRequest.language}'`);
    if(!languageInDb) throw new Error(`The following language is invalid: ${greetingRequest.language}`);

    const toneInDb = await db.get(`SELECT DISTINCT tone FROM greetings WHERE tone = '${greetingRequest.tone}'`);
    if(!toneInDb) throw new Error(`The following tone is invalid: ${greetingRequest.tone}`);

    const greeting = await db.get(
      `SELECT greetingMessage FROM greetings WHERE timeOfDay = '${greetingRequest.timeOfDay}' AND language = '${greetingRequest.language}' AND tone = '${greetingRequest.tone}'`,
    );

    if (!greeting) return res.status(404).json({ error: 'Greeting not found' });

    const greetingResponse = new GreetingResponse(greeting.greetingMessage);
    res.json({ message: 'success', data: greetingResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all times of day
app.get('/api/GetAllTimesOfDay', async (req, res) => {
  try {
    const timesOfDay = await db.all('SELECT DISTINCT timeOfDay FROM greetings');
    res.json({ message: 'success', data: timesOfDay });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all supported languages
app.get('/api/GetSupportedLanguages', async (req, res) => {
    try {
      const languages = await db.all('SELECT DISTINCT language FROM greetings');
      res.json({ message: 'success', data: languages });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET all supported languages
app.get('/api/GetAllTones', async (req, res) => {
  try {
    const tones = await db.all('SELECT DISTINCT tone FROM greetings');
    res.json({ message: 'success', data: tones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST a new greeting. I know this isn't required but added it for my own testing and curiosity
app.post('/api/greet', async (req, res) => {
  const { timeOfDay, language, greetingMessage, tone} = req.body;
  if (!timeOfDay || !language || !greetingMessage || !tone) {
    return res.status(400).json({ error: 'Dear user, time of day, language, and tone are required.' });
  }

  try {
    const result = await db.run('INSERT INTO greetings (timeOfDay, language, greetingMessage, tone) VALUES (?, ?, ?, ?)', [timeOfDay, language, greetingMessage, tone]);
    res.json({ message: 'success', data: { id: result.lastID, timeOfDay, language, greetingMessage, tone } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});