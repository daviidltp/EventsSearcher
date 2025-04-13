  // Inicializar el manejo del bottom sheet
//   function initBottomSheet() {
//   const bottomSheet = document.getElementById('street-info-container');
//   const dragHandle = document.getElementById('bottom-sheet-handle');
//   bottomSheetHeight = bottomSheet.offsetHeight;
  
//   // Añadir botón para mostrar panel si está oculto (mantener por si acaso)
//   const mapContainer = document.querySelector('.map-container');
//   const showButton = document.createElement('button');
//   showButton.id = 'show-bottom-sheet';
//   showButton.innerHTML = '↑';
//   showButton.className = 'show-bottom-btn hidden';
//   showButton.addEventListener('click', showBottomSheet);
//   mapContainer.appendChild(showButton);
  
//   // Solo activar para móviles
//   if (window.innerWidth <= 768) {
//     let isDragging = false;
    
//     // Evento para iniciar el arrastre SOLO en el tirador
//     dragHandle.addEventListener('touchstart', function(e) {
//       touchStartY = e.touches[0].clientY;
//       bottomSheet.style.transition = 'none';
//       isDragging = true;
//       e.stopPropagation(); // Importante: detiene la propagación
//     }, { passive: false });

//     // Evento para el arrastre - solo si comenzó en el tirador
//     document.addEventListener('touchmove', function(e) {
//       if (!isDragging) return;
      
//       touchCurrentY = e.touches[0].clientY;
//       const deltaY = touchCurrentY - touchStartY;
      
//       // Permitir arrastres
//       const newHeight = Math.max(0, Math.min(window.innerHeight * 0.8, bottomSheetHeight - deltaY));
//       bottomSheet.style.height = `${newHeight}px`;
      
//       // Movimiento vertical
//       if (deltaY > bottomSheetHeight/2) {
//         bottomSheet.style.transform = `translateY(${deltaY}px)`;
//       } else {
//         bottomSheet.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
//       }
//     }, { passive: true });

//     // Evento para finalizar el arrastre
//     document.addEventListener('touchend', function() {
//       if (!isDragging) return;
//       isDragging = false;
      
//       bottomSheet.style.transition = 'transform 0.3s ease, height 0.3s ease';
      
//       // Procesar el resultado del arrastre
//       if (touchCurrentY < touchStartY - 50 && (bottomSheetState === 'collapsed' || bottomSheetState === 'peeking')) {
//         expandBottomSheet();
//       } 
//       else if (touchCurrentY > touchStartY + 100 && bottomSheetState === 'collapsed') {
//         hideBottomSheet();
//       }
//       else if (touchCurrentY > touchStartY + 50 && bottomSheetState === 'expanded') {
//         collapseBottomSheet();
//       }
//       else if (bottomSheetState === 'peeking') {
//         showBottomSheet();
//       }
//       else {
//         bottomSheet.style.transform = '';
//         bottomSheet.style.height = '';
//       }
//     }, { passive: true });
    
//     // Evento click solo en el tirador (no arrastre)
//     dragHandle.addEventListener('click', function(e) {
//       e.stopPropagation();
      
//       if (bottomSheetState === 'collapsed') {
//         expandBottomSheet();
//       } else if (bottomSheetState === 'expanded') {
//         collapseBottomSheet();
//       } else if (bottomSheetState === 'peeking') {
//         showBottomSheet();
//       }
//     });
//   }
// }
// function expandBottomSheet() {
//     const bottomSheet = document.getElementById('street-info-container');
//     bottomSheet.style.height = '80vh';
//     bottomSheet.style.transform = 'translateY(0)';
//     bottomSheet.classList.add('expanded');
//     bottomSheetState = 'expanded';
//   }

//   function collapseBottomSheet() {
//     const bottomSheet = document.getElementById('street-info-container');
//     bottomSheet.style.height = '';
//     bottomSheet.style.transform = '';
//     bottomSheet.classList.remove('expanded');
//     bottomSheetState = 'collapsed';
//   }
  
//   function hideBottomSheet() {
//   const bottomSheet = document.getElementById('street-info-container');
  
//   // En lugar de ocultar completamente, dejamos asomar la parte del tirador (aproximadamente 20px)
//   bottomSheet.style.transform = 'translateY(calc(100% - 20px))';
//   bottomSheetState = 'peeking'; // Nuevo estado que indica que está casi oculto pero con el tirador visible
  
//   // Añadimos una clase visual para resaltar el tirador
//   bottomSheet.classList.add('peeking');
//   bottomSheet.classList.remove('expanded');
// }
  
  
// function showBottomSheet() {
//   const bottomSheet = document.getElementById('street-info-container');
//   bottomSheet.style.transform = '';
//   bottomSheetState = 'collapsed';
  
//   // Quitar la clase peeking
//   bottomSheet.classList.remove('peeking');
  
//   // Eliminar el botón si existe
//   const showButton = document.getElementById('show-bottom-sheet');
//   if (showButton) {
//     showButton.remove();
//   }
// }