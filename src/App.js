import React, { useState, useRef, useCallback } from 'react'
import './App.css'
import beepSound from './assets/shot-timer-beep.mp3'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateSequence(labelType, distinctCount, totalEngagements) {
  const labels =
    labelType === 'letters'
      ? Array.from({ length: distinctCount }, (_, i) => String.fromCharCode(65 + i))
      : Array.from({ length: distinctCount }, (_, i) => String(i + 1))

  if (totalEngagements <= distinctCount) {
    // Randomly pick totalEngagements unique targets
    return shuffle(labels).slice(0, totalEngagements)
  }
  // Every target at least once, fill extras randomly
  const extras = Array.from(
    { length: totalEngagements - distinctCount },
    () => labels[Math.floor(Math.random() * labels.length)]
  )
  return shuffle([...shuffle(labels), ...extras])
}

function playBeep() {
  new Audio(beepSound).play()
}

export default function App() {
  const [labelType, setLabelType] = useState('letters')
  const [distinctCount, setDistinctCount] = useState(3)
  const [totalEngagements, setTotalEngagements] = useState(5)
  const [distinctInput, setDistinctInput] = useState('3')
  const [shotsInput, setShotsInput] = useState('5')
  const [sequence, setSequence] = useState(() => generateSequence('letters', 3, 5))
  const [waiting, setWaiting] = useState(false)
  const timerRef = useRef(null)

  const regenerate = useCallback(
    (type = labelType, distinct = distinctCount, total = totalEngagements) => {
      setSequence(generateSequence(type, distinct, total))
    },
    [labelType, distinctCount, totalEngagements]
  )

  const handleStart = useCallback(() => {
    if (waiting) return
    setWaiting(true)
    const delay = 4000 + Math.random() * 1000
    timerRef.current = setTimeout(() => {
      playBeep()
      setWaiting(false)
    }, delay)
  }, [waiting])

  const handleLabelType = (type) => {
    const maxDistinct = type === 'letters' ? 26 : 99
    const clamped = Math.min(distinctCount, maxDistinct)
    setLabelType(type)
    setDistinctCount(clamped)
    setDistinctInput(String(clamped))
    setSequence(generateSequence(type, clamped, totalEngagements))
  }

  const handleDistinctChange = (raw) => {
    setDistinctInput(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed)) {
      const max = labelType === 'letters' ? 26 : 99
      const n = Math.max(2, Math.min(parsed, max))
      setDistinctCount(n)
      setSequence(generateSequence(labelType, n, totalEngagements))
    }
  }

  const handleDistinctBlur = () => {
    const n = Math.max(2, parseInt(distinctInput, 10) || 2)
    setDistinctCount(n)
    setDistinctInput(String(n))
    setSequence(generateSequence(labelType, n, totalEngagements))
  }

  const handleShotsChange = (raw) => {
    setShotsInput(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      setTotalEngagements(parsed)
      setSequence(generateSequence(labelType, distinctCount, parsed))
    }
  }

  const handleShotsBlur = () => {
    const n = Math.max(1, parseInt(shotsInput, 10) || 1)
    setTotalEngagements(n)
    setShotsInput(String(n))
    setSequence(generateSequence(labelType, distinctCount, n))
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">Target Trainer</span>
      </header>

      <section className="config">
        <div className="label-toggle">
          <button
            className={`toggle-btn${labelType === 'letters' ? ' active' : ''}`}
            onClick={() => handleLabelType('letters')}
          >
            Letters
          </button>
          <button
            className={`toggle-btn${labelType === 'numbers' ? ' active' : ''}`}
            onClick={() => handleLabelType('numbers')}
          >
            Numbers
          </button>
        </div>

        <div className="config-row">
          <label className="config-label">
            <span>Targets</span>
            <input
              type="number"
              min={2}
              max={labelType === 'letters' ? 26 : 99}
              value={distinctInput}
              onChange={(e) => handleDistinctChange(e.target.value)}
              onBlur={handleDistinctBlur}
            />
          </label>
          <label className="config-label">
            <span>Shots</span>
            <input
              type="number"
              min={1}
              value={shotsInput}
              onChange={(e) => handleShotsChange(e.target.value)}
              onBlur={handleShotsBlur}
            />
          </label>
        </div>
      </section>

      <section className="sequence">
        {sequence.map((label, i) => (
          <span key={i} className="chip">
            {label}
          </span>
        ))}
      </section>

      <footer className="actions">
        <button className="btn-regen" onClick={() => regenerate()} disabled={waiting}>
          ↻
        </button>
        <button className="btn-start" onClick={handleStart} disabled={waiting}>
          {waiting ? 'Ready…' : 'Start'}
        </button>
      </footer>
    </div>
  )
}
