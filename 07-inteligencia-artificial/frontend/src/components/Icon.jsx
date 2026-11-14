// Icono de Material Symbols (decorativo: siempre acompañado de texto)
export function Icon ({ name, size = 20, fill = false, className = '', style }) {
  return (
    <span
      className={`icon${fill ? ' icon-fill' : ''}${className ? ` ${className}` : ''}`}
      style={{ fontSize: size, ...style }}
      aria-hidden='true'
    >
      {name}
    </span>
  )
}
