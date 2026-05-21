import React, { useState, useRef, useCallback } from 'react'
import './App.css'

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
  // Guarantee every target appears at least once
  const base = shuffle(labels)
  const extras = Array.from(
    { length: totalEngagements - distinctCount },
    () => labels[Math.floor(Math.random() * labels.length)]
  )
  return shuffle([...base, ...extras])
}

function playBeep() {
  // Generates a WAV blob in memory — no external file, no network request.
  // Square wave at 2700 Hz mimics the piezo buzzer used in shot timers (PACT, CED).
  const sampleRate = 44100
  const frequency = 2700
  const holdTime = 0.18   // full volume (seconds)
  const decayTime = 0.04  // linear ramp to silence
  const totalSamples = Math.floor(sampleRate * (holdTime + decayTime))

  const wavBuffer = new ArrayBuffer(44 + totalSamples * 2)
  const view = new DataView(wavBuffer)
  const write = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)) }

  write(0, 'RIFF'); view.setUint32(4, 36 + totalSamples * 2, true)
  write(8, 'WAVE'); write(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  write(36, 'data'); view.setUint32(40, totalSamples * 2, true)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    const square = Math.sign(Math.sin(2 * Math.PI * frequency * t))
    const env = t < holdTime ? 1 : 1 - (t - holdTime) / decayTime
    view.setInt16(44 + i * 2, Math.round(square * env * 28000), true)
  }

  const url = URL.createObjectURL(new Blob([wavBuffer], { type: 'audio/wav' }))
  const audio = new Audio(url)
  audio.onended = () => URL.revokeObjectURL(url)
  audio.play()
}

export default function App() {
  const [labelType, setLabelType] = useState('letters')
  const [distinctCount, setDistinctCount] = useState(3)
  const [totalEngagements, setTotalEngagements] = useState(5)
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
    setSequence(generateSequence(type, clamped, totalEngagements))
  }

  const handleDistinctCount = (raw) => {
    const max = labelType === 'letters' ? 26 : 99
    const n = Math.max(2, Math.min(parseInt(raw, 10) || 2, max))
    // Shots must be at least as many as distinct targets
    const shots = Math.max(totalEngagements, n)
    setDistinctCount(n)
    setTotalEngagements(shots)
    setSequence(generateSequence(labelType, n, shots))
  }

  const handleTotalEngagements = (raw) => {
    const n = Math.max(distinctCount, parseInt(raw, 10) || distinctCount)
    setTotalEngagements(n)
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
              value={distinctCount}
              onChange={(e) => handleDistinctCount(e.target.value)}
            />
          </label>
          <label className="config-label">
            <span>Shots</span>
            <input
              type="number"
              min={distinctCount}
              value={totalEngagements}
              onChange={(e) => handleTotalEngagements(e.target.value)}
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
