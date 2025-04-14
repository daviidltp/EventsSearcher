// Mantener registro de la última posición de scroll
let lastScrollTop = 0;
let ticking = false;

// Elementos que queremos mostrar/ocultar según dirección
const elementsToToggle = [];

// Inicializar detector de dirección
export function initScrollDirectionDetector() {
  // Esperar a que se cargue el DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Recopilar todos los elementos con atributos data-scroll-show
    document.querySelectorAll('[data-scroll-show]').forEach(el => {
      elementsToToggle.push({
        element: el,
        originalAos: el.getAttribute('data-aos'),
        appeared: false
      });
    });

    // Listener para el evento scroll
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollingDown = scrollTop > lastScrollTop;
          
          // Procesar cada elemento según dirección
          elementsToToggle.forEach(item => {
            const rect = item.element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.75 && 
                             rect.bottom > 0;
            
            if (isVisible) {
              if (!item.appeared) {
                // Primera aparición - usar el efecto AOS original
                item.element.setAttribute('data-aos', item.originalAos);
                item.appeared = true;
              } else {
                // Apariciones subsecuentes según dirección
                if (scrollingDown) {
                  item.element.setAttribute('data-aos', 'fade-up');
                } else {
                  item.element.setAttribute('data-aos', 'fade-down');
                }
              }
              
              // Refrescar AOS para este elemento
              if (window.AOS) {
                window.AOS.refresh();
              }
            }
          });
          
          // Guardar la posición actual para siguiente comparación
          lastScrollTop = scrollTop;
          ticking = false;
        });
        
        ticking = true;
      }
    });
  });
}