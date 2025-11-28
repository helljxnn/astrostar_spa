// Utilidad para tooltips instantáneos sin modificar componentes

let tooltipElement = null;

function createTooltipElement() {
  if (tooltipElement) return tooltipElement;
  
  tooltipElement = document.createElement('div');
  tooltipElement.className = 'instant-tooltip';
  tooltipElement.style.cssText = `
    position: fixed;
    background-color: #1f2937;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    line-height: 1.4;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.1s ease-in;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 500;
  `;
  document.body.appendChild(tooltipElement);
  return tooltipElement;
}

function showTooltip(button, text) {
  const tooltip = createTooltipElement();
  const rect = button.getBoundingClientRect();
  
  tooltip.textContent = text;
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 8}px`;
  tooltip.style.transform = 'translate(-50%, -100%)';
  tooltip.style.opacity = '1';
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
  }
}

export function initInstantTooltips() {
  console.log('🎯 Tooltips instantáneos inicializados');

  const handleMouseOver = (e) => {
    const button = e.target.closest('button[disabled][title]');
    if (button && button.hasAttribute('title')) {
      const title = button.getAttribute('title');
      console.log('✅ Tooltip detectado:', title);
      if (title) {
        button.setAttribute('data-original-title', title);
        button.removeAttribute('title');
        showTooltip(button, title);
      }
    }
  };

  const handleMouseOut = (e) => {
    const button = e.target.closest('button[disabled]');
    if (button && button.hasAttribute('data-original-title')) {
      const originalTitle = button.getAttribute('data-original-title');
      button.setAttribute('title', originalTitle);
      button.removeAttribute('data-original-title');
      hideTooltip();
    }
  };

  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);

  console.log('📌 Event listeners agregados');

  // Retornar función de limpieza
  return () => {
    console.log('🧹 Limpiando tooltips');
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    if (tooltipElement && tooltipElement.parentNode) {
      tooltipElement.parentNode.removeChild(tooltipElement);
      tooltipElement = null;
    }
  };
}
