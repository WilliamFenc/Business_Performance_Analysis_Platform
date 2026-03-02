import { useState } from 'react';

/**
 * AccordionSection - 摺疊式區塊組件
 * 用於多欄位表單的分組顯示
 *
 * @param {string} id - 區塊 ID
 * @param {string} title - 區塊標題
 * @param {boolean} defaultOpen - 預設是否展開
 * @param {React.ReactNode} children - 子內容
 * @param {boolean} isOpen - 受控的展開狀態（可選）
 * @param {function} onToggle - 展開/摺疊回調（可選）
 * @param {string} badge - 標籤文字（可選）
 */
function AccordionSection({
  id,
  title,
  defaultOpen = false,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  badge
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`accordion-section ${isOpen ? 'open' : 'closed'}`}>
      <div
        className="accordion-header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>
          {isOpen ? '▼' : '▶'}
        </span>
        <span className="accordion-title">{title}</span>
        {badge && <span className="accordion-badge">{badge}</span>}
      </div>
      <div
        id={`accordion-content-${id}`}
        className={`accordion-content ${isOpen ? 'open' : 'closed'}`}
        aria-hidden={!isOpen}
      >
        {isOpen && <div className="accordion-content-inner">{children}</div>}
      </div>
    </div>
  );
}

export default AccordionSection;
