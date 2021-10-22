import express from 'express'

import { main } from './main.js'

const app = express()

app.get('/', (req, res) => main(req, res) )

app.listen(7007)
