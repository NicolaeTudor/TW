const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = process.env.PORT || 8800;
app.use(express.json());

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const groceriesRouter = require('./routes/groceriesRoutes');
const fridgeRouter = require('./routes/fridgeRoutes');
const recipesRouter = require('./routes/recipesRoutes');
const gameRouter = require('./routes/gameRoutes');

app.use('/groceryList', groceriesRouter);
app.use('/fridge', fridgeRouter);
app.use('/recipe', recipesRouter);
app.use('/game', gameRouter);

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'views/layout.html'));
});

app.listen(port, () => {
  debug(`listening at Port ${chalk.green(port)}`);
});
