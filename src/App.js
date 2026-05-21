import React, { useState, useRef, useCallback } from 'react'
import './App.css'

function generateSequence(labelType, distinctCount, totalEngagements) {
  const labels =
    labelType === 'letters'
      ? Array.from({ length: distinctCount }, (_, i) => String.fromCharCode(65 + i))
      : Array.from({ length: distinctCount }, (_, i) => String(i + 1))
  return Array.from(
    { length: totalEngagements },
    () => labels[Math.floor(Math.random() * labels.length)]
  )
}

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.value = 1100
  gain.gain.setValueAtTime(0.9, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
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
    setDistinctCount(n)
    setSequence(generateSequence(labelType, n, totalEngagements))
  }

  const handleTotalEngagements = (raw) => {
    const n = Math.max(1, parseInt(raw, 10) || 1)
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
              min={1}
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
          Regenerate
        </button>
        <button className="btn-start" onClick={handleStart} disabled={waiting}>
          {waiting ? 'Ready…' : 'Start'}
        </button>
      </footer>
    </div>
  )
}
