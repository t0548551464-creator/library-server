const express = require('express');
const booksRouter = require('./routes/books'); // ייבוא הראוטר של הספרים
const usersRouter = require('./routes/users'); // ייבוא הראוטר של המשתמשים

const app = express();
app.use(express.json()); // מאפשר קריאת נתונים בפורמט JSON

// חיבור הראוטרים לנתיבים הראשיים
app.use('/books', booksRouter);
app.use('/users', usersRouter);

// נתיב בדיקה בסיסי
app.get('/', (req, res) => {
  res.send('Server is running: http://localhost:5000');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});