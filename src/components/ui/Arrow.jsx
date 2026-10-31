export default function Arrow({ direction = 'up' }) {
  return <span aria-hidden="true">{direction === 'down' ? '↓' : '↗'}</span>;
}
