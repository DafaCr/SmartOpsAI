import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { useAnalysis } from '../context/AnalysisContext.jsx'
import { Icon } from '../components/Icon.jsx'
import { DecisionBadge } from '../components/DecisionBadge.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import {
  CATEGORIAS, canal, efectivo, formatSeconds, formatTime, historyToCsv, prioridadClass, shortRef, timeAgo
} from '../lib/format.js'
import styles from './MetricsPage.module.css'

// Metas del proyecto
const META = { evaluaciones: 30, clasificacion: 85, utiles: 80, tiempoMs: 120_000 }
const PAGE_SIZE = 10

const PERIODOS = [
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'mes', label: 'Este mes' },
  { value: 'todo', label: 'Todo' }
]

function inPeriod (timestamp, periodo) {
  if (periodo === 'todo') return true
  const now = new Date()
  if (periodo === 'mes') {
    const d = new Date(timestamp)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }
  return timestamp >= now.getTime() - 30 * 24 * 3600 * 1000
}

const avg = values => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)
const pct = (part, total) => (total ? (part / total) * 100 : null)
const fmtPct = value => (value == null ? '—' : `${value.toFixed(value % 1 === 0 ? 0 : 1)} %`)

export default function MetricsPage () {
  const navigate = useNavigate()
  const { history } = useAnalysis()
  const [periodo, setPeriodo] = useState('30d')
  const [page, setPage] = useState(0)

  const entries = useMemo(
    () => history.entries.filter(e => inPeriod(e.createdAt, periodo)),
    [history.entries, periodo]
  )

  const m = useMemo(() => {
    const decididas = entries.filter(e => e.decision)
    const aprobadas = decididas.filter(e => e.decision.tipo === 'aprobada').length
    const corregidas = decididas.filter(e => e.decision.tipo === 'corregida').length
    const tiemposIA = entries.map(e => e.elapsedMs).filter(Number.isFinite)
    const tiemposHumano = decididas
      .map(e => e.decision.at - (e.createdAt ?? e.decision.at))
      .filter(ms => Number.isFinite(ms) && ms >= 0)

    const porCategoria = new Map(CATEGORIAS.map(c => [c, 0]))
    let fueraDeAlcance = 0
    for (const e of entries) {
      if (e.analisis.estado === 'rechazada') { fueraDeAlcance++; continue }
      const { categoria } = efectivo(e)
      if (categoria) porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + 1)
    }
    const distribucion = [...porCategoria.entries()].map(([label, n]) => ({ label, n }))
    if (fueraDeAlcance) distribucion.push({ label: 'Fuera de alcance (rechazadas por la IA)', n: fueraDeAlcance })
    distribucion.sort((a, b) => b.n - a.n)

    return {
      total: entries.length,
      decididas: decididas.length,
      pendientes: entries.length - decididas.length,
      clasificacion: pct(aprobadas, decididas.length),
      utiles: pct(aprobadas + corregidas, decididas.length),
      tiempoIA: avg(tiemposIA),
      tiempoHumano: avg(tiemposHumano),
      distribucion
    }
  }, [entries])

  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages - 1)
  const rows = entries.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const downloadCsv = () => {
    const blob = new Blob([historyToCsv(entries)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smartops-analisis-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearHistory = () => {
    if (window.confirm('¿Borrar todo el historial de análisis de este navegador? No se puede deshacer.')) {
      history.clear()
    }
  }

  const lastUpdate = history.entries[0]?.decision?.at ?? history.entries[0]?.createdAt

  return (
    <main className={styles.page}>
      <title>Métricas · SmartOps AI</title>

      <div className={styles.top}>
        <div className={styles.intro}>
          <div className={styles.introRow}>
            <span className={styles.pillLive}>
              <span className={styles.pulse} aria-hidden='true' />
              Supervisión FRIOCHAP S.A.C.
            </span>
            {lastUpdate && <span className={styles.updated}>Actualizado {timeAgo(lastUpdate).toLowerCase()}</span>}
          </div>
          <h1>Métricas de rendimiento operativo</h1>
          <p>
            Impacto, precisión y supervisión humana de SmartOps AI, calculados con los análisis y
            decisiones registrados en este navegador.
          </p>
        </div>

        <div className={styles.periods} role='radiogroup' aria-label='Periodo'>
          {PERIODOS.map(p => (
            <button
              key={p.value}
              type='button'
              role='radio'
              aria-checked={periodo === p.value}
              className={periodo === p.value ? styles.periodActive : undefined}
              onClick={() => { setPeriodo(p.value); setPage(0) }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <Kpi
          label='Solicitudes evaluadas'
          icon='checklist_rtl'
          num={m.total}
          format={n => Math.round(n)}
          i={0}
          suffix={`/ ${META.evaluaciones}`}
          caption={`Meta del ciclo: ${META.evaluaciones} evaluaciones`}
          progress={(m.total / META.evaluaciones) * 100}
          footIcon='info'
          foot={m.total >= META.evaluaciones ? 'Meta del ciclo alcanzada' : `Faltan ${META.evaluaciones - m.total} para la meta`}
        />
        <Kpi
          label='Clasificación correcta'
          icon='psychology'
          num={m.clasificacion}
          format={fmtPct}
          i={1}
          caption={`Meta: ≥ ${META.clasificacion} %`}
          trend={m.clasificacion != null ? m.clasificacion - META.clasificacion : null}
          progress={m.clasificacion}
          footIcon='verified'
          foot={m.decididas ? `Aprobadas sin cambios · ${m.decididas} validadas` : 'Sin validaciones todavía'}
        />
        <Kpi
          label='Recomendaciones útiles'
          icon='thumb_up'
          num={m.utiles}
          format={fmtPct}
          i={2}
          caption={`Meta: ≥ ${META.utiles} %`}
          trend={m.utiles != null ? m.utiles - META.utiles : null}
          progress={m.utiles}
          footIcon='task_alt'
          foot='Aprobadas o corregidas (no rechazadas)'
        />
        <Kpi
          label='Tiempo promedio de análisis'
          icon='bolt'
          num={m.tiempoIA}
          format={formatSeconds}
          i={3}
          caption='Meta: < 2 min'
          progress={m.tiempoIA != null ? Math.max(0, 100 - (m.tiempoIA / META.tiempoMs) * 100) : null}
          footIcon='speed'
          foot={m.tiempoIA != null ? `${Math.round(100 - (m.tiempoIA / META.tiempoMs) * 100)} % por debajo de la meta máxima` : 'Sin análisis todavía'}
        />
      </div>

      {/* Gobernanza */}
      <section className={`card ${styles.governance} rise`} style={{ '--i': 4 }}>
        <div className={styles.govMain}>
          <div className={styles.shield}>
            <Icon name='shield' size={36} fill />
            <span className={styles.shieldCheck}><Icon name='check_circle' size={16} /></span>
          </div>
          <div>
            <div className={styles.govTitleRow}>
              <h2>Acciones ejecutadas sin validación humana: <span>0</span></h2>
              <span className='chip'>Por diseño</span>
            </div>
            <p>
              SmartOps AI no ejecuta acciones: solo propone. <strong>Cada análisis queda pendiente</strong> hasta
              que un operador lo aprueba, corrige o rechaza.
            </p>
          </div>
        </div>
        <div className={styles.govStats}>
          <div><strong>{m.decididas}</strong><span>Validadas</span></div>
          <div className={m.pendientes ? styles.govPending : undefined}><strong>{m.pendientes}</strong><span>Pendientes</span></div>
        </div>
      </section>

      {/* Gráficos */}
      <div className={styles.charts}>
        <section className={`card ${styles.chartCard} rise`} style={{ '--i': 5 }} aria-labelledby='dist-title'>
          <div className={styles.chartHead}>
            <div>
              <h2 id='dist-title'>Distribución por tipología</h2>
              <p>Solicitudes por categoría (tras la corrección del operador)</p>
            </div>
            <Icon name='bar_chart' size={20} className={styles.muted} />
          </div>
          {m.total === 0
            ? <EmptyChart />
            : (
              <ul className={styles.bars}>
                {m.distribucion.map(({ label, n }, idx) => {
                  const share = (n / m.total) * 100
                  return (
                    <li key={label} className={n === 0 ? styles.barZero : undefined} title={`${label}: ${n} (${share.toFixed(0)} %)`}>
                      <div className={styles.barLabel}>
                        <span>{label}</span>
                        <span className={styles.barValue}>{n} · {share.toFixed(0)} %</span>
                      </div>
                      <div className={styles.barTrack}>
                        <span className={styles.barFill} style={{ width: `${Math.max(share, n ? 2 : 0)}%`, '--i': idx }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
              )}
        </section>

        <section className={`card ${styles.chartCard} ${styles.chartWide} rise`} style={{ '--i': 6 }} aria-labelledby='speed-title'>
          <div className={styles.chartHead}>
            <div>
              <h2 id='speed-title'>Velocidad de respuesta y ciclo de validación</h2>
              <p>Tiempo de la IA frente al tiempo hasta la decisión del operador</p>
            </div>
          </div>
          <div className={styles.speedTiles}>
            <div className={styles.speedTile}>
              <span className={styles.tileLabel}><span className={styles.swatchAi} aria-hidden='true' />Análisis SmartOps AI</span>
              <span className={styles.tileValue}>{formatSeconds(m.tiempoIA)} <small>media</small></span>
              <p>Búsqueda en la base de conocimiento, análisis del modelo y validación del formato.</p>
            </div>
            <div className={styles.speedTile}>
              <span className={styles.tileLabel}><span className={styles.swatchHuman} aria-hidden='true' />Validación humana</span>
              <span className={styles.tileValue}>{formatSeconds(m.tiempoHumano)} <small>media</small></span>
              <p>Desde que termina el análisis hasta que el operador aprueba, corrige o rechaza.</p>
            </div>
          </div>
          <SpeedBar ia={m.tiempoIA} humano={m.tiempoHumano} />
        </section>
      </div>

      {/* Tabla */}
      <section className={`card ${styles.tableCard} rise`} style={{ '--i': 7 }} aria-labelledby='tabla-title'>
        <div className={styles.tableHead}>
          <div>
            <h2 id='tabla-title'>Últimas solicitudes analizadas</h2>
            <p>Registro de análisis asistidos por IA y su validación</p>
          </div>
          <div className={styles.tableActions}>
            <button type='button' className='btn btn-secondary' onClick={downloadCsv} disabled={entries.length === 0}>
              <Icon name='download' size={18} /> Descargar CSV
            </button>
            {history.entries.length > 0 && (
              <button type='button' className={`btn ${styles.clear}`} onClick={clearHistory}>
                <Icon name='delete' size={18} /> Borrar historial
              </button>
            )}
          </div>
        </div>

        {entries.length === 0
          ? (
            <div className={styles.tableEmpty}>
              <Icon name='inbox' size={28} />
              <p>No hay análisis en este periodo.</p>
              <Link to='/' className='btn btn-primary'>Analizar una solicitud</Link>
            </div>
            )
          : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope='col'>Solicitud</th>
                      <th scope='col'>Categoría</th>
                      <th scope='col'>Prioridad</th>
                      <th scope='col'>Decisión</th>
                      <th scope='col' className={styles.right}>Tiempo IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(e => {
                      const { categoria, prioridad } = efectivo(e)
                      return (
                        <tr key={e.id} onClick={() => navigate(`/resultado/${e.id}`)} className={styles.row}>
                          <td>
                            <Link to={`/resultado/${e.id}`} className={styles.reqTitle} onClick={ev => ev.stopPropagation()}>
                              {e.analisis.resumen || e.solicitud.texto}
                            </Link>
                            <span className={styles.reqMeta}>
                              {shortRef(e.id)} • {canal(e.solicitud.origen).label} • {formatTime(e.createdAt)}
                            </span>
                          </td>
                          <td>
                            {categoria
                              ? <span className='chip'>{categoria}</span>
                              : <span className={styles.muted}>Fuera de alcance</span>}
                          </td>
                          <td>
                            {prioridad
                              ? <span className={`pill ${prioridadClass(prioridad)}`}>{prioridad}</span>
                              : <span className={styles.muted}>—</span>}
                          </td>
                          <td><DecisionBadge decision={e.decision} compact /></td>
                          <td className={`${styles.right} ${styles.time}`}>{formatSeconds(e.elapsedMs)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.pagination}>
                <span>Mostrando {rows.length} de {entries.length} análisis del periodo</span>
                <div>
                  <button type='button' disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</button>
                  <span>{currentPage + 1} / {pages}</span>
                  <button type='button' disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
                </div>
              </div>
            </>
            )}
      </section>
    </main>
  )
}

function Kpi ({ label, icon, num, format, i = 0, suffix, caption, trend, progress, footIcon, foot }) {
  const width = progress == null ? 0 : Math.min(100, Math.max(0, progress))
  const animated = useCountUp(num)
  const value = animated == null ? '—' : format(animated)
  return (
    <section className={`card ${styles.kpi} rise lift`} style={{ '--i': i }}>
      <div className={styles.kpiHead}>
        <span>{label}</span>
        <span className={styles.kpiIcon}><Icon name={icon} size={18} /></span>
      </div>
      <div className={styles.kpiValue}>
        <strong>{value}</strong>
        {suffix && <span>{suffix}</span>}
      </div>
      <div className={styles.kpiCaption}>
        <span>{caption}</span>
        {trend != null && (
          <span className={trend >= 0 ? styles.trendUp : styles.trendDown}>
            <Icon name={trend >= 0 ? 'trending_up' : 'trending_down'} size={12} />
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)} pts
          </span>
        )}
      </div>
      <div className={styles.meter} role='img' aria-label={`${label}: ${value}`}>
        <span style={{ width: `${width}%` }} />
      </div>
      <div className={styles.kpiFoot}>
        <Icon name={footIcon} size={15} />
        <span>{foot}</span>
      </div>
    </section>
  )
}

function SpeedBar ({ ia, humano }) {
  if (ia == null) return <EmptyChart />
  const total = ia + (humano ?? 0)
  const iaShare = (ia / total) * 100
  return (
    <div className={styles.speedBar}>
      <div className={styles.speedBarHead}>
        <span>Tiempo promedio acumulado (meta de análisis: 120 s)</span>
        <strong>{formatSeconds(total)} totales</strong>
      </div>
      <div className={styles.segmented} role='img' aria-label={`IA ${formatSeconds(ia)}, validación humana ${formatSeconds(humano)}`}>
        <span className={styles.segAi} style={{ width: `${iaShare}%` }} title={`SmartOps AI: ${formatSeconds(ia)}`} />
        {humano != null && <span className={styles.segHuman} style={{ width: `${100 - iaShare}%` }} title={`Operador: ${formatSeconds(humano)}`} />}
      </div>
      <div className={styles.legend}>
        <span><span className={styles.swatchAi} aria-hidden='true' /> SmartOps AI ({formatSeconds(ia)})</span>
        <span><span className={styles.swatchHuman} aria-hidden='true' /> Operador FRIOCHAP ({humano != null ? formatSeconds(humano) : 'sin validaciones'})</span>
      </div>
    </div>
  )
}

function EmptyChart () {
  return <p className={styles.emptyChart}>Aún no hay datos en este periodo.</p>
}
