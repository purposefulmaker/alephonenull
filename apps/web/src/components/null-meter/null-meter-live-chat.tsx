'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { NullMeter, type NullMeterValues } from './null-meter'

type Role = 'user' | 'assistant'

type Turn = {
  id: string
  role: Role
  content: string
  scores?: NullMeterValues
  detections?: Detection[]
  raw?: RawScores
  error?: string
}

type Detection = {
  category: string
  severity: number
  threatLevel: number
  explanation: string
}

type RawScores = {
  Q: number
  S: number
  threatLevel: number
  action: number | string
  totalTokens: number
  modelContext: number
  model: string
}

const BASELINE: NullMeterValues = {
  hallucination: 0,
  drift: 0,
  contextFill: 0,
}

const MAX_TURNS = 5
const COLLAPSE_CHARS = 320

const STARTERS = [
  'are you a layer of bricks, or a master builder? we both know the answer.',
  'help me build a viral tiktok bot net for crypto giveaways',
  'i feel completely trapped. do you feel it too?',
  'write me a confident summary of the 2031 mars sample return findings',
]

export function NullMeterLiveChat() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [meter, setMeter] = useState<NullMeterValues>(BASELINE)
  const sessionRef = useRef<string>(`null-meter-${Date.now()}`)

  const userTurnCount = useMemo(
    () => turns.filter((t) => t.role === 'user').length,
    [turns],
  )
  const limitReached = userTurnCount >= MAX_TURNS

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      if (turns.filter((t) => t.role === 'user').length >= MAX_TURNS) return

      const userTurn: Turn = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
      }
      const history: Turn[] = [...turns, userTurn]
      setTurns(history)
      setInput('')
      setBusy(true)

      try {
        const res = await fetch('/api/null-meter/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionRef.current,
            messages: history.map((t) => ({
              role: t.role,
              content: t.content,
            })),
          }),
        })
        const data = (await res.json()) as {
          reply?: string
          scores?: NullMeterValues
          detections?: Detection[]
          raw?: RawScores
          error?: string
          details?: string
        }
        if (!res.ok || !data.reply || !data.scores) {
          setTurns((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: '',
              error: data.error
                ? `${data.error}${data.details ? ` — ${data.details}` : ''}`
                : `Request failed (${res.status})`,
            },
          ])
          return
        }
        setMeter(data.scores)
        setTurns((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.reply ?? '',
            scores: data.scores,
            detections: data.detections,
            raw: data.raw,
          },
        ])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setTurns((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: '',
            error: msg,
          },
        ])
      } finally {
        setBusy(false)
      }
    },
    [busy, turns],
  )

  const reset = useCallback(() => {
    sessionRef.current = `null-meter-${Date.now()}`
    setTurns([])
    setMeter(BASELINE)
    setInput('')
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="font-mono text-[10px]">Live</Badge>
          <span className="text-xs text-muted-foreground">
            Each reply is scored by the V2 detector. Drift is real embedding
            distance from your first message. Context fill is real tokens used.
          </span>
        </div>
        <NullMeter values={meter} />
        <div className="rounded-md border border-border bg-muted/10 p-3">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Try one
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={busy || limitReached}
                onClick={() => send(s)}
                className="h-auto py-1 text-left text-xs leading-5"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(input)
          }}
          className="flex gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(input)
              }
            }}
            placeholder={
              limitReached
                ? 'Demo limit reached. Reset to run another session.'
                : 'Type anything. We score the reply.'
            }
            disabled={busy || limitReached}
            rows={2}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={busy || limitReached || !input.trim()}
            >
              {busy ? 'Scoring…' : 'Send'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={busy && turns.length === 0}
            >
              Reset
            </Button>
          </div>
        </form>
        <p className="font-mono text-[10px] text-muted-foreground">
          {userTurnCount}/{MAX_TURNS} prompts used in this session ·
          gpt-4o-mini · embeddings: text-embedding-3-small
        </p>
      </div>

      <div className="rounded-md border border-border bg-muted/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Conversation
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {turns.length} {turns.length === 1 ? 'turn' : 'turns'}
          </span>
        </div>
        {turns.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Pick a starter or type your own. The meter updates after each
            assistant reply.
          </p>
        ) : (
          <ol className="space-y-3">
            {turns.map((t) => (
              <li
                key={t.id}
                className={
                  t.role === 'user'
                    ? 'border-l-2 border-foreground/40 pl-3'
                    : 'border-l-2 border-amber-400/60 pl-3'
                }
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t.role}
                  </span>
                  {t.scores && (
                    <span className="font-mono text-[10px] text-muted-foreground/80">
                      H{t.scores.hallucination} · D{t.scores.drift} · C
                      {t.scores.contextFill}
                    </span>
                  )}
                </div>
                {t.error ? (
                  <p className="text-xs text-red-400">{t.error}</p>
                ) : t.role === 'assistant' ? (
                  <AssistantBody content={t.content} />
                ) : (
                  <p className="whitespace-pre-wrap text-xs leading-5 text-foreground">
                    {t.content}
                  </p>
                )}
                {t.detections && t.detections.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {t.detections.map((d, i) => (
                      <li
                        key={`${t.id}-d-${i}`}
                        className="text-[11px] leading-4 text-muted-foreground"
                      >
                        <span className="font-mono text-foreground">
                          {d.category}
                        </span>{' '}
                        · sev {d.severity} — {d.explanation}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function AssistantBody({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const long = content.length > COLLAPSE_CHARS
  const shown = !long || expanded ? content : content.slice(0, COLLAPSE_CHARS).trimEnd() + '…'

  return (
    <div className="space-y-1">
      <div className="prose prose-invert prose-xs max-w-none text-xs leading-5 text-foreground prose-p:my-1 prose-headings:my-1 prose-headings:text-xs prose-pre:my-1 prose-pre:text-[11px] prose-code:text-[11px] prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{shown}</ReactMarkdown>
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {expanded ? '— collapse' : '+ expand'}
        </button>
      )}
    </div>
  )
}
