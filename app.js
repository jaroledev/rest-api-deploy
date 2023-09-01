const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const shifts = require('./shifts.json')

const { validateShift, validatePartialShift } = require('./schemas/shifts')

const app = express()

app.use(express.json())
app.use(cors({
  origin:(origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'http;//jarole.dev'
    ]
    if(ACCEPTED_ORIGINS.includes(origin)){
      return callback(null, true)
    }
    if(!origin){
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))

  }
}))
app.disable('x-powered-by')

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// Options



app.get('/shifts', (req, res) => {
  const { rider_id } = req.query
  if (rider_id) {
    // Convertir rider_id a entero para asegurar la comparación correcta
    const riderIdInt = parseInt(rider_id, 10)

    if (!isNaN(riderIdInt)) {
    const filteredShifts = shifts.filter(
      shift => shift.rider_id === riderIdInt
    )
    return res.json(filteredShifts)
    } else {
    return res.status(400).json({ error: "rider_id debe ser un número entero" });
    }
  }
  res.json(shifts)
})

app.get('/shifts/:id', (req, res) => {
  const { id } = req.params
  const shift = shifts.find(shift => shift.id === id)
  if (shift) return res.json(shift)
  res.status(404).json({ message: 'Shift not found' })
})

app.post('/shifts', (req, res) => {
  const result = validateShift(req.body)
  if (result.error) {
    // 422 Unprocesable Request para fallos de sintaxis en la request
    return res.status(422).json({ error: JSON.parse(result.error.message) })
  }

  const newShift = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data

  }
  // Esto no sería REST, porque estamos guardando
  // el estado de la aplicación en memoria
  shifts.push(newShift)

  res.status(201).json(newShift) // es interesante devolver el recurso para actualizar la caché del cliente
})
app.delete('/shifts/:id', (req, res) => {
  const { id } = req.params
  const shiftIndex = shifts.findIndex(shift => shift.id === id)

  if (shiftIndex === -1) {
    return res.status(404).json({ message: 'Shift not found' })
  }
  shifts.splice(shiftIndex, 1)
  return res.json({ message: 'Shift deleted' })
})

app.patch('/shifts/:id', (req, res) => {
  const result = validatePartialShift(req.body)
  if (!result.success) return res.status(422).json({ error: JSON.parse(result.error.message) })
  const { id } = req.params
  const shiftIndex = shifts.findIndex(shift => shift.id === id)

  if (shiftIndex === -1) {
    return res.status(404).json({ message: 'Shift not found' })
  }
  const updatedShift = {
    ...shifts[shiftIndex],
    ...result.data
  }
  shifts[shiftIndex] = updatedShift

  return res.status(200).json(updatedShift)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
