# Dirección de los tres pilotos · E4

Base inspeccionada: UI11/23/20 en1920/390 y Curso modal;209estados en baseline.
No copiar la hoja ni su reloj/columnas; la comparación operativa es la protagonista.

Paleta existente: guinda#661124 para acción, marino#1C2140 para estructura,
superficie#FFFFFF, soporte#F4F5F7, texto#191B28, error#A92B34. Curso conserva su color.
Montserrat en título, Open Sans en datos;14–16px y secundarios≥12px.

```text
Docentes:   tarea + total                  exportar / alta
            búsqueda / curso / selección
            identidad · curso · dedicación · carga · acciones
Monitor:    salón / turno                 enlaces / solicitudes / partes
            Semana | Por día              directorio bajo demanda
            horario (ancho principal)     docentes/contactos
Cursos:     tarea                         agregar
            nombre + color · preview · editar/eliminar
            diálogo pequeño: nombre/color/preview; cancelar/guardar
```

Revisión contra brief: no añadir métricas/cards decorativas ni otro tema. El
piloto previo de Docentes ya compara bien en desktop; su problema medido es acceso
a acciones/identidad larga en móvil, ayudas solo title y error confundido con vacío.
Monitor tiene banner/contexto duplicados y grilla truncada; comprimir contexto y
hacer dato completo alcanzable sin cambiar selección/propietarios. Cursos conserva
modal existente y habilitación por nombre, mejorando foco y error persistente.

Ayudas: prueba pilots falló con foco al botónEditarCourse (no tooltipDOM). Es
necesario posicionar sobre tabla con scroll y dentro de top layer. Dependencia
acotada autorizada: @floating-ui/react0.27.20,MIT,peerReact>=17compatible19;6paquetes,
versiónexacta y lock. No reemplaza modales/ayudas de Partes. Delta build se mide
al adoptarla; tamaño unpacked934317B no se confunde con gzip/descarga.

Frontera: variantes opt-in de IconButton/RowActions/DataTable/ScheduleView, sin
cambiar defaults ni importar el nuevo tooltip desde la hoja. Montaje de formularios
estable; no autoguardado, no confirmación nueva, no cambios de payload/permisos.

Aceptación no se declara por esta dirección: prueba3pilotos, sieteanchos,
foco/Escape/touch/overlays/errores y noalteración dePartes. E3 y motores/zoom/lector
mantienen controles abiertos; el trabajo independiente prepara pilotos sin
etiquetar la puerta externa como aprobada.
