const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Pad naar JSON-bestand
const DATA_FILE = path.join(__dirname, 'data.json');

// Zorg dat data.json bestaat
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
}

// Functie om data te laden
function loadNotes() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

// Functie om data op te slaan
function saveNotes(notes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
}

// Opmerking ophalen
app.get('/api/notes/:barcode', (req, res) => {
  const notes = loadNotes();
  const barcode = req.params.barcode;

  if (notes[barcode]) {
    res.json({ exists: true, barcode, note: notes[barcode] });
  } else {
    res.json({ exists: false, barcode });
  }
});

// Alle barcodes ophalen
app.get('/api/notes', (req, res) => {
  const notes = loadNotes();
  const list = Object.entries(notes).map(([barcode, note]) => ({ barcode, note }));
  res.json(list);
});

// Opmerking toevoegen of wijzigen
app.post('/api/notes', (req, res) => {
  const notes = loadNotes();
  const { barcode, note } = req.body;

  const existed = !!notes[barcode];
  notes[barcode] = note;

  saveNotes(notes);

  res.json({ success: true, existed });
});

// Opmerking verwijderen
app.delete('/api/notes/:barcode', (req, res) => {
  const notes = loadNotes();
  const barcode = req.params.barcode;

  const existed = !!notes[barcode];
  delete notes[barcode];

  saveNotes(notes);

  res.json({ success: true, existed });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API draait op poort ${PORT}`));
