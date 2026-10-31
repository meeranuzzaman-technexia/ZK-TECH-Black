/**
 * Accordion-style list: rows expand on hover/focus to reveal an image.
 * Pure CSS animation (see .hover-expand in the stylesheet), no extra dependencies.
 *
 * item: { label, sublabel?, image, imageAlt?, description?, href?, index? }
 */
export default function HoverExpand({
  items,
  collapsedHeight,
  expandedHeight,
  className = '',
}) {
  const style = {};
  if (collapsedHeight) style['--collapsed'] = `${collapsedHeight}px`;
  if (expandedHeight) style['--expanded'] = `${expandedHeight}px`;

  return (
    <div className={`hover-expand ${className}`.trim()} style={style}>
      {items.map((item, i) => {
        const Tag = item.href ? 'a' : 'div';
        const number = item.index ?? String(i + 1).padStart(2, '0');

        return (
          <Tag
            className="hover-expand__row"
            href={item.href}
            tabIndex={item.href ? undefined : 0}
            key={`${item.label}-${i}`}
          >
            <div className="hover-expand__media" aria-hidden="true">
              <img
                src={item.image}
                alt={item.imageAlt ?? ''}
                loading={i > 1 ? 'lazy' : 'eager'}
                decoding="async"
              />
            </div>

            <div className="hover-expand__content">
              <div className="hover-expand__main">
                <span className="hover-expand__index">{number}</span>
                <span className="hover-expand__label">{item.label}</span>
                {item.description && (
                  <span className="hover-expand__desc">— {item.description}</span>
                )}
              </div>

              {/* {(item.sublabel || item.href) && (
                <div className="hover-expand__side">
                  {item.sublabel && (
                    <span className="hover-expand__sublabel">{item.sublabel}</span>
                  )}
                  {item.href && (
                    <span className="hover-expand__arrow" aria-hidden="true">↗</span>
                  )}
                </div>
              )} */}
            </div>
          </Tag>
        );
      })}
    </div>
  );
}