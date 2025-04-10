## Contribución
Para contribuir:
1. Crea tu rama (solo la primera vez)
 ```bash
git checkout -b <nombre-de-tu-rama>
git push -u origin <nombre-de-tu-rama>  # Sube la rama al remoto y la vincula
   ```


2. Antes de empezar a trabajar (Actualizar tu rama)
 ```bash
git switch V2  # Asegúrate de estar en master/main
git pull origin V2  # Descarga cambios más recientes de master
git checkout <nombre-de-tu-rama>  # Vuelve a tu rama
git merge V2  # Fusiona los últimos cambios de master en tu rama
   ```


3. Haz cambios y súbelos a tu rama
 ```bash
git add .
git commit -m "Descripción clara de los cambios"
git push origin <nombre-de-tu-rama>
 ```

4. Cuando termines y quieras fusionar con master
 ```bash
git switch V2
git pull origin V2  # Asegúrate de tener lo último
git merge <nombre-de-tu-rama>  # Fusiona tu trabajo en master
git push origin V2  # Sube los cambios al repositorio
 ```
