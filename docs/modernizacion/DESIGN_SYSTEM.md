# Sistema de diseño — dirección contractual

> Enmienda2026-11-04: [alcance vigente](FINALIZACION_20261104.md). La protección
> de Partes conserva todo salvo la cabecera global expresamente autorizada.

Actualización contractual: 2026-11-03. **La propuesta oficial y validada de Partes
es la referencia visual elegida por el cliente para el resto del sistema**.
Su [análisis técnico y visual](ANALISIS_PROPUESTA_OFICIAL.md) documenta cómo está
hecha y qué decisiones son trasladables. No se rediseña la referencia.

**Prohibición de alcance:** no modificar la maqueta, sus capturas ni Partes en
ninguno de sus roles. El usuario implementará Partes antes de este refactor;
su implementación recibida queda tal cual. Rige el [cerrojo del plan](MASTER_PLAN.md#cerrojo-de-partes-obligatorio)
y CF-13, incluso para cambios indirectos de estilos, tokens, portales o compartidos.
Esta revisión cambia solo contratos; no autoriza implementar código ahora.

La validación de la maqueta no prueba aplicación, backend ni accesibilidad integral.
No copiar sus reglas de simulación o limitaciones técnicas. Se conserva CEPRUNSA:
herramienta académica precisa, color semántico, lectura breve y operación contextual.

## Rectificación visual: menos carga, más interacción útil

El usuario rechaza el exceso de texto, secciones y datos simultáneos. La filosofía
es **reconocer por color, forma e icono; actuar junto al dato; leer solo lo necesario**.
El movimiento comunica respuesta o cambio, no decora. Reflow, avatares y recolorear
la composición anterior no bastan. Tampoco basta ocultar texto indiscriminadamente.

La primera vista muestra contexto, datos para elegir, estados relevantes y acción
principal. Explicaciones secundarias van a ayuda contextual; detalles a selección,
expansión o modal de tarea. Los datos, funciones y vistas siguen disponibles.
«Menos texto» nunca elimina nombres, valores, etiquetas de formulario, consecuencias,
errores, restricciones aplicables ni información necesaria para decidir.

| ID | Criterio de diseño obligatorio |
|---|---|
| UX-01 | Primera vista: contexto necesario, datos para elegir y acción principal identificable. Eliminar títulos, logos y metadatos repetidos dentro de la misma pantalla. |
| UX-02 | Detalle secundario mediante acceso visible, próximo al dato y con nombre accesible. Las acciones locales conocidas pueden ser iconos con tooltip; nunca depender exclusivamente de hover ni esconder acciones frecuentes en menús profundos. |
| UX-03 | Sustituir párrafos permanentes por etiquetas claras y ayuda contextual. Errores, conflictos, borradores, plazos que bloquean y consecuencias de una acción permanecen visibles cuando aplican. |
| UX-04 | Lista/tabla para comparar, agenda para secuencia horaria, panel para operar sobre un registro. No convertir cada dato en tarjeta, métrica o sección independiente. |
| UX-05 | Interactividad ligada a tareas: selección visible, edición contextual, feedback de carga/guardado/error y preservación del contexto. Sin autoguardado, escrituras al seleccionar ni nuevos pasos obligatorios. |
| UX-06 | Móvil reorganiza por prioridad; el detalle sigue alcanzable y vuelve al contexto. Preservar borradores, foco y selección al cambiar presentación; no remontar propietarios de estado. |
| UX-07 | Verificar jerarquía y carga de lectura con antes/después y tareas concretas, además de overflow. Una pantalla técnicamente correcta pero aún textual/saturada no supera la puerta visual. |
| UX-08 | Estado = color semántico + icono/forma + nombre accesible; etiqueta breve visible cuando decide o desambigua. Distinguir identidad/categoría de éxito, selección de autorización y vacío de error. |
| UX-09 | Un significado por icono dentro del contexto; familia de trazo consistente. Icono local no sustituye el texto de una acción principal, decisión crítica o destino poco conocido. |
| UX-10 | Tooltip breve y secundario, accesible con foco y puntero, descartable con Escape y sin recorte. Lo esencial también se alcanza en táctil sin necesitar tooltip. |
| UX-11 | Modal compacto para una tarea acotada; contexto mínimo, foco aislado/restaurado, pie visible. Conservar cierre, habilitación, borradores y guardado del flujo real. |
| UX-12 | Feedback en el lugar del cambio: hover/foco/selección/carga/éxito/error/deshabilitado. No confundir preparado con persistido, ni cambiar acciones habilitadas por estética. |
| UX-13 | Retirar texto redundante de la vista, no datos del producto. Cada texto trasladado tiene un destino accesible registrado; una ayuda que evita un error no es relleno. |
| UX-14 | Ningún color, contador, animación o icono inventa estados de negocio ni cálculos nuevos. Reflejar datos y reglas existentes, sin solicitudes adicionales por fila. |
| UX-15 | Movimiento corto y funcional, sin retrasar operación ni desplazar datos. Reducción de movimiento cubre todas las transiciones añadidas. |
| UX-16 | Mantener capacidad y contexto en 320 px, zoom y táctil. Un control no desaparece por carecer de hover; scroll interno no equivale a tarea verificada. |
| UX-17 | Reutilizar componentes, React Icons y React Toastify; Floating UI solo para problemas flotantes concretos. Sin nuevo kit visual ni otro motor de negocio/estado. |
| UX-18 | Partes permanece intacto directa e indirectamente; si un compartido lo altera, el lote no se acepta. Nunca editar Partes o su referencia para acomodar el refactor. |
| UX-19 | Medir coste de dependencias, renderizado e interacciones con los mismos fixtures. Sin carga masiva de imágenes, tooltips en todos los nodos ni virtualización preventiva. |
| UX-20 | Una pantalla solo se cierra con fidelidad visual, equivalencia funcional, accesibilidad aplicable y no alteración de Partes documentadas por separado. |

### Referencia inmutable, no pantalla pendiente de rediseño

La [propuesta oficial y validada](propuestas/monitor.html) es la única referencia.
Se consulta en lectura: chips discretos, tabla protagonista, acción desde la celda,
icono coherente, tooltip secundario y modal compacto. Los siete bloques, códigos de
clase, reloj simulado, línea temporal y flujo local de imágenes **no son patrones
que haya que imponer a todas las pantallas**. Su análisis no es una orden de editarla.

No quedan piloto de evidencias ni una migración de Partes en H8. Los hallazgos de
accesibilidad de esa maqueta se documentan, no se corrigen dentro de este encargo.
El resto implementa la misma intención con mecanismos accesibles y contratos reales.

## Tokens de referencia para los módulos no protegidos

| Uso | Base |
|---|---|
| Acción principal | Guinda `#661124` |
| Hover principal | `#7D1B32` |
| Estructura | Marino `#1C2140` |
| Fondo / superficie suave | `#F4F5F7` / `#F8F9FC` |
| Superficie | `#FFFFFF` |
| Texto principal / secundario | `#191B28` / `#686D80` |
| Separación / límite fuerte | `#E2E3EA` / `#D2D4DF` |
| Información/actualidad | `#25608F` sobre `#EEF6FD` |
| Positivo | `#24614B` sobre `#EAF5EF` |
| Atención/pendiente | `#86570B` sobre `#FFF4DC` |
| Error/destrucción | `#A92B34` sobre `#FFF0F1` |
| Categoría/sustitución | `#5B4389` sobre `#F1EDF9` |
| Dorado | Acento institucional excepcional |

Son referencias, no una autorización para reemplazar `:root`, reset o fuentes de
toda la aplicación. Reutilizar tokens compatibles; ajustes necesarios solo opt-in
fuera de Partes, sin cambiar sus valores heredados ni su presentación. No crear un
segundo tema global ni cambiar colores de cursos guardados por el usuario.

Color categórico no comunica éxito/fracaso. Selección usa borde/marca además de
fondo; pendientes incluyen icono y significado legible; superficies de solo lectura
no tienen hover de botón. Rojo se reserva a problemas/destrucción reales, no a toda
notificación. El guinda de marca no sustituye el rojo de error.

Contraste comprobado en las combinaciones efectivas: texto normal 4,5:1, texto
grande 3:1 y límites identificadores/estados no textuales 3:1 cuando aplica. Borde
decorativo no es borde identificador de control. Foco de 2–3 px, visible y no tapado;
en colores forzados también se mantiene forma/contorno. No heredar grises tenues
o baja opacidad de la maqueta como prueba de contraste.

Escala espacial de referencia: 4/8/12/16/20/24 px; radios 6–8 px en controles/chips,
10–12 en superficie y 12–14 en modal. Sombra suave en la superficie protagonista,
mayor en overlays; no sombra en cada dato. Adaptar con los tokens existentes.

Open Sans operativa; Montserrat títulos. Cuerpo 14–16 px, datos 13–14 px,
secundarios al menos 12 px y títulos 22–28 px según espacio. Cifras tabulares en
horas/números; pesos 500–700 como base. Cabeceras cortas de tabla pueden usar
mayúscula discreta; no títulos, párrafos o etiquetas sistemáticamente en mayúsculas.
Nunca reducir letra para lograr un número fijo de filas.

## Layout y densidad

- Desktop-first: 1920×1080. Operación fluida hasta aproximadamente 1840 px útiles.
- Con sidebar: ocupar espacio restante sin otro max-width estrecho anidado.
- Una cabecera compacta: título de tarea, contexto y acciones; sin párrafo de
  presentación salvo que cambie una decisión. Chips informativos no simulan botones.
- Una superficie principal; barra contextual de filtros/acciones. Evitar tarjetas
  anidadas, métricas gigantes, líneas de tiempo o paneles auxiliares sin tarea real.
- Formularios con grupos legibles; explicación de longitud propia, no estirada al
  ancho de tabla. Panel auxiliar solo si el flujo ya necesita trabajo simultáneo.
- Horarios/tablas protagonistas; menos cabeceras/banners sobredimensionados. Las
  filas no se expanden artificialmente para llenar la pantalla.
- Conservar tarjetas y ambas vistas donde existen; no envolver cada sección.
- Ultrapanorámicos con límites razonables. En tamaños menores reordenar sin
  quitar capacidades, usar scroll interno necesario, no encoger tipografía para
  forzar tabla. Recuperar acceso a información oculta actualmente en móvil.

## Texto, iconos y ayudas

### Política de texto

| Tratamiento | Contenido |
|---|---|
| Visible y breve | Nombres/valores para elegir, etiqueta de campo, filtros activos, acción principal, decisión irreversible, error y consecuencia aplicable |
| Icono con nombre accesible y tooltip | Editar, ampliar, copiar, cerrar, añadir a una lista o acción local inequívoca; contexto del registro en el nombre cuando se repite |
| Tooltip de una frase | Significado de una cabecera, icono secundario o abreviatura que no sea la única forma de conocer un dato esencial |
| Detalle accesible | Correo/metadato largo, historial, descripción extendida y opciones infrecuentes; con enlace/botón explícito y retorno |
| Suprimir por redundancia | Segundo título del mismo recurso, descripción que repite la acción, banners de instrucciones obvias, conteos duplicados y textos técnicos ajenos a la tarea |

Los datos reales del registro no son «texto de más». Elipsis/resumen requieren
acceso al contenido completo con teclado y táctil. No sustituir etiquetas por
placeholders, ni errores por tooltip, ni consecuencias de borrado por una papelera.
Una acción de aprobación dice qué se aprueba; un check aislado no es suficiente.

### Diccionario de iconos

Reutilizar `react-icons/fi`, ya instalado y de trazo próximo a la referencia.
Lápiz = editar; papelera = eliminar/quitar según la operación real; esquinas = ampliar;
flecha de subida = seleccionar/subir según el paso real; descarga = descargar;
reloj = tiempo/pendiente; alerta = problema; check = confirmado en su ámbito;
calendario = fecha; usuario/usuarios = persona/grupo; edificio = aula; intercambio =
reemplazo; información = ayuda; más = añadir; X = cerrar; imagen = imagen;
filtro = filtros; puntos = acciones secundarias. No introducir otro set para la
misma función ni añadir SVG manuales que dupliquen una solución instalada.

Iconos de acción 16–18 px; auxiliares 12–14 px. El glyph no determina el tamaño del
botón: mínimo general de objetivo 24×24 px o separación equivalente según WCAG
2.2; política del proyecto ≥44×44 px en táctil, sin solapar objetivos adyacentes.
`aria-label` preciso, SVG decorativo oculto al lector; usar `aria-pressed`,
`aria-expanded`, `aria-current` o estado nativo según corresponda. No fabricar
roles interactivos sobre spans. Botones/enlaces hermanos, nunca anidados.

Hover revela énfasis o un lápiz secundario, **no la única forma de descubrir o
activar la función**. En táctil las acciones permanecen visibles; en teclado tienen
foco real. Acciones principales y decisiones críticas conservan etiqueta visible.
El estado del icono no modifica permisos ni oculta una restricción relevante.

### Tooltips y popovers

- Tooltip: no interactivo, normalmente una frase y hasta aproximadamente 250 px,
  texto de al menos 12 px, fondo marino, borde/radio discreto y contraste AA.
- Apertura orientativa 400–500 ms con puntero; foco sin demora innecesaria y nunca
  más de 350 ms. Sin timeout de lectura. Escape lo descarta sin mover el foco;
  no reaparece mientras continúe la misma interacción descartada.
- Activable al hover y al foco de un disparador alcanzable; `role=tooltip` y relación
  `aria-describedby` cuando es descripción. El nombre del control existe sin ayuda.
  No dejar el tooltip visible con `aria-hidden=true` ni duplicar tooltip y `title`.
- Debe poder mantenerse al pasar el puntero sobre la ayuda y hasta abandonar
  disparador/ayuda o descartarla. Se cierra también al abrir otro contexto o desmontar.
- Anclaje estable al control, separación 8–12 px, inversión/desplazamiento por
  colisión y margen de viewport de 8 px. Recalcular con scroll/resize solo mientras
  esté abierto. No perseguir el cursor en controles de formulario o tabla.
- Los iconos informativos de cabecera necesitan activador accesible; en táctil una
  ayuda necesaria se obtiene por tap mediante popover o detalle, no por hover ficticio.
- Si hay enlaces, botones, texto extenso, selección o interacción, es **popover o
  diálogo**, no tooltip. El popover tiene su propia semántica/foco/cierre.
- En un diálogo nativo, la capa flotante se monta dentro de la top layer/contexto
  correcto. Un portal a `document.body` y un z-index alto no lo resuelven. No
  recortar ayudas con el scroll de la tabla ni escapar del aislamiento modal.

## Componentes e interacción

Evolucionar composición local → opt-in de primitivo existente → extracción mínima
cuando haya repetición demostrada. Mantener propietarios de estado, claves,
proveedores y callbacks funcionales. No montar/desmontar el editor por un cambio
de breakpoint. Los compartidos mantienen su comportamiento y aspecto por defecto
para Partes; no hay «actualización global» implícita.

| Contexto | Patrón conservado/mejorado |
|---|---|
| Persona | Drawer con aislamiento y retorno de foco |
| Detalle desde listado | Entrada junto al dato; modal/panel según la tarea ya existente, con acceso explícito por teclado |
| Destrucción | Confirmación breve |
| Asignación/disponibilidad | Página y grilla editable |
| Notificaciones | Campana/popover, resolver distinto de decidir |
| Filtros secundarios | Desplegable/sección existente |
| Historial | Detalle/diálogo amplio según flujo existente |
| Notas fuera de Partes | Resumen legible y editor contextual; tipos/autoría/límites y guardado existentes |
| Generación | Asistente de cuatro pasos |

### Contrato de modales fuera de Partes

- Usar el `Dialog` nativo existente. Tarea pequeña: referencia 480–590 px; visor
  amplio solo si el contenido lo exige. No hacer pantalla completa por defecto.
- Título de tarea, contexto breve, cierre en esquina y pie con acciones reales del
  flujo. Cuerpo flexible con scroll si hace falta; cabecera/pie alcanzables. No
  exigir «sin scroll» a costa de datos, tamaño de letra o accesibilidad.
- Foco inicial a la primera entrada útil o al título/acción segura según el caso;
  Tab/Shift+Tab contenidos, fondo inerte, título asociado y retorno al origen o al
  equivalente estable si la lista se actualiza. No devolver a un nodo desmontado.
- Escape, X, backdrop y Cancelar/Descartar ejecutan la política **ya existente**.
  Conservar protección de cambios y operaciones en curso; no copiar el descarte
  incondicional de la demo ni añadir confirmaciones universales nuevas.
- Abrir, elegir una tarjeta, ampliar o previsualizar no escribe en servidor. El
  guardado sigue en la misma operación/instante y conserva habilitación/validación.
  Mostrar dirty cuando exista; no introducir un nuevo bloqueo «sin cambios» que
  suprima una escritura válida del contrato actual.
- Datos condicionales solo según reglas vigentes, manteniendo valores y payload.
  Selección única con radios nativos o navegación equivalente completa; no basta
  añadir `role=radio` y color. No añadir etapas Guardar interiores/exteriores.
- Evitar modales encadenados; si un visor existente debe superponerse, solo el
  superior recibe foco/Escape. No instalar otro focus trap sobre `<dialog>`.
- Loading real con control ocupado y tamaño estable; fallo conserva contexto y
  borrador. Éxito solo tras confirmación real. Errores accionables permanecen junto
  al campo/operación; toast breve únicamente como refuerzo, no única evidencia.

### Librerías y plataforma: decisión acotada

| Necesidad | Recurso seleccionado para futura implementación | Límite |
|---|---|---|
| Estilos, color y movimiento | Tailwind 4 y CSS existentes | Sin framework de tema ni dependencia de animación |
| Iconos | React Icons 5, familia `fi` existente | Imports concretos, no otro set ni paquete completo por comodidad |
| Feedback transitorio | React Toastify 11 existente | Sin Sonner/otro contenedor; no cambiar defaults que afecten a Partes |
| Modal y controles | `Dialog`/`Field` y HTML nativo existentes | No sustituir todos los overlays ni duplicar gestión de foco |
| Tooltip/popover y colisiones complejas | `@floating-ui/react`, adopción puntual prevista | No instalado actualmente; no instalar en esta revisión; comprobar versión compatible con React 19, licencia, lock y delta de bundle al implementar |
| Tabla, horario, estado y transporte | Componentes, hooks y servicios ya existentes | Sin nueva tabla/virtualización/formulario/estado/API para un cambio visual |

La elección de Floating UI se apoya en su documentación de
[tooltips](https://floating-ui.com/docs/tooltip),
[hover](https://floating-ui.com/docs/useHover) y
[portales](https://floating-ui.com/docs/FloatingPortal), consultada para este contrato.
Reutilizar `useHover`/`useFocus`/`useDismiss`/`useRole` mediante `useInteractions`;
posicionamiento con `offset`/`flip`/`shift` y `autoUpdate` solo montado/abierto.
`whileElementsMounted:autoUpdate` solo con renderizado condicional de la capa;
si se conserva oculta por CSS, iniciar/limpiar mediante el estado de apertura.
Mantener hover con cierre adecuado, sin bloquear celdas vecinas. El portal recibe
el contenedor correcto cuando hay top layer. No activar observadores por cada fila.

La librería resuelve geometría e interacciones, **no garantiza por sí sola**
accesibilidad de un menú, permisos, foco modal, touch ni ausencia de fugas. Un menú
de acciones necesita navegación/activación/retorno completos; no se crea por
simplemente usar `useRole`. Reutilizar el patrón actual si no hay problema medido.
No añadir además Radix/Headless UI/MUI/shadcn u otra solución para el mismo cometido.
No se autorizan versiones flotantes, peso supuesto ni instalaciones en este encargo.

## Aplicación por familia de pantallas (sin Partes)

Esta matriz traslada decisiones de diseño, no cambia el inventario funcional.
Cada variante de rol conserva los datos y operaciones que ya tiene autorizados.

| Superficie / IDs | Traducción del lenguaje elegido | Intocable funcionalmente |
|---|---|---|
| Acceso, mantenimiento y error — UI-01/02 | Identidad sobria, una tarea/estado claro, icono y mensaje breve con recuperación visible; sin héroes promocionales ni explicaciones duplicadas | OAuth/popup, acceso admin en mantenimiento, logout y destinos de recuperación; el motivo de bloqueo no se oculta en ayuda |
| Navegación, cabecera y cuenta — todas las elegibles | Ubicación compacta, destino activo con marca/forma, iconos estables, nombres en navegación expandida y ayudas en contraída; acciones de cuenta inequívocas | Rutas/enlaces directos, estado/persistencia del menú y sesión; aplicación opt-in sin cambiar cabecera/layout de Partes |
| Paneles de rol — UI-03/21/23/26 | Accesos de tarea, contexto y conteos compactos; horario/listado principal según el rol; alertas localizadas, sin bloques de bienvenida o KPIs decorativos | Todos los accesos/conteos/alcances/filtros existentes; error distinto de vacío, solicitudes, enlaces y exportaciones; acceso a Partes conserva destino sin cambiar su implementación |
| Personal y coordinación — UI-11/14/15/17/30/31 | Una tabla comparable, nombre/correo jerárquicos, identidad con iniciales, estados y acciones locales mediante iconos/ayudas; detalle de persona bajo demanda | Búsqueda/filtros, selección múltiple, exportación, altas/ediciones, DNI/correo inmutables cuando aplique, eliminación lógica y coordinación solo lectura |
| Cursos — UI-20 | Color como categoría con nombre visible, edición pequeña en modal, lápiz/papelera consistentes; preview del resultado sin párrafos | Color elegido y `courseTint`, validación, CRUD y rechazo por asociaciones; no limitar paleta ni cambiar habilitación de Guardar |
| Salones/listados y detalle — UI-18/19/33/34/35 | Tabla/tarjetas existentes con contexto breve y estados diferenciados; detalle centrado en horario/docentes; acciones Meet/Classroom reconocibles | Ambas vistas, área/turno por ID, filtros, alta múltiple, enlaces, asignar/retirar/eliminar y restricciones de coordinación |
| Horarios y disponibilidad — UI-12/13/21/23/26/32 | Grilla protagonista, cabeceras estables, bloques legibles e información contextual sin timeline añadida; herramientas separadas del contenido | Semana/Por día, intervalos, disponibilidad, cobertura/cruces/carga, asignaciones, grilla editable particular y contratos Excel; no nuevo cálculo ni motor |
| Monitores de supervisor — UI-16 | Asignados/disponibles comparables, contexto de área/turno compacto y acción junto a la persona; estado seleccionado evidente | Asignar/quitar, paginación, filtros y efectos actuales; no añadir arrastre como única operación ni cambiar elegibilidad |
| Solicitudes y avisos — UI-05/22/25/28 y campana | Estado con icono/color/nombre breve, solicitante/trabajo jerárquicos, decisiones locales con etiqueta visible; notificación no es una segunda ficha completa | Solicitar, candidatos, PDF, cancelar/decidir según rol, reservas/idempotencia/versiones; resolver aviso no decide solicitud; SSE/sondeo y contexto sin cambios |
| Incidencias — UI-06/29 y entradas desde personal | Tipo/estado con señal visual, hecho resumido pero íntegro en detalle, historial bajo demanda; compositor con etiquetas de tipo claras, no solo símbolos | Autoría, DNI/alcance/fechas, inmutabilidad, antecedentes prohibidos, versiones y resolver/reabrir; no copiar las notas locales de Partes ni editar sus entradas internas |
| Reportes — UI-07 | Filtros compactos con etiquetas y datos como superficie central; descargar reconocible con nombre; detalle largo accesible, no explicación introductoria repetida | Cuatro tipos, rango, paginación, columnas/datos y Excel existentes; no agregados o indicadores nuevos de sanción/remuneración |
| Importación — UI-09 | Zona de archivo simple con arrastre y selección equivalente; estado de archivo/validación/previsualización/aplicación separado visualmente | Tres tipos generales, plantilla/cabeceras exactas y ayuda de formato accesible, errores por fila, límites y aplicar explícito; no esconder requisitos imprescindibles en tooltip ni añadir formatos |
| Generación — UI-08 | Cuatro pasos existentes con avance sobrio, selección visible, resumen de decisión y feedback; sin paneles de texto repetidos | Borrador/persistencia, cálculos, validaciones, turnos/salones y confirmación final; no convertirlo en colección de modales ni cambiar número/orden de pasos |
| Configuración — UI-10 | Estado actual y propuesta distinguibles; controles agrupados, selección clara, historial bajo demanda y advertencia solo cuando aplica | Mantenimiento/proceso visible, versión/motivo/restaurar, validación y efectos vigentes; acciones de alto impacto siempre con nombre y consecuencias visibles |
| Partes — UI-04/24/27 | **Ninguna adaptación. Referencia visual y módulo protegidos** | Todo el módulo, incluidos consumidores indirectos; H8 solo prueba no alteración |

No convertir todos los drawers en modales, todas las vistas en tarjetas ni todas
las acciones en iconos. La consistencia es de jerarquía, vocabulario y respuesta,
no de imponer un único contenedor a tareas distintas. Una mejora del resto nunca
autoriza sincronizar o «poner al día» Partes después.

## Movimiento y accesibilidad

| Respuesta | Tratamiento permitido fuera de Partes |
|---|---|
| Hover/foco | Color/contorno/opacidad 120–160 ms; no cambiar dimensiones |
| Ayuda/feedback breve | Opacidad y, opcionalmente, 2–4 px de desplazamiento; sin mover el dato |
| Overlay/panel | Como máximo 160–220 ms, si aporta continuidad; apertura nativa sin animación también válida |
| Operación pendiente | Spinner/estado ocupado mientras exista operación real; no porcentaje inventado |
| Confirmación | Cambio de icono/estado y realce breve, aproximadamente 1 s; no repetir sin nueva acción |

No animar filas en cascada, hacer saltar tablas, usar parallax, rebotes, skeletons
con brillo continuo ni hacer latir todos los pendientes. Si se precisa pulso no
esencial, acotarlo a menos de 5 s y dejar señal estática equivalente; la maqueta no
autoriza copiar pulsos infinitos. No retrasar clic, habilitación, cierre o error
para esperar una transición. Animar preferentemente opacidad/transform; no height,
width o position de grandes listas ni `transition:all` indiscriminado.

`prefers-reduced-motion:reduce` elimina desplazamiento, escala, pulso y animaciones
añadidas no esenciales; conservar respuesta estática y anuncios. Verificar también
con hover desactivado y colores forzados. Un spinner no es el nombre de la operación.

WCAG 2.2 AA aplicable: teclado completo, nombre accesible, relaciones campo/error,
foco visible/no oculto sticky, aislamiento/restauración de overlays, mensajes
anunciados, alternativa al clic de filas, contraste de texto/controles y reflow.
Lector de pantalla manual, Firefox y WebKit se declaran pendientes sin ejecución.

## Validación visual

Pilotos: **Docentes, horario del Monitor fuera de Partes y modal de Cursos**.
Validar los tres según [H3_PILOTS.md](H3_PILOTS.md), sin inventar otra propuesta
visual. El piloto de evidencias de Partes queda expresamente retirado.

Por pantalla conservar una matriz antes/después de campos, datos, acciones,
destinos, filtros, etiquetas obligatorias, condiciones de habilitación y efectos.
Registrar texto eliminado por redundancia y destino del detalle trasladado. Medir
filas visibles y lectura requerida para la misma tarea, sin metas artificiales de
porcentaje de texto ni datos ocultos para aparentar mejora.

Capturas sintéticas en tamaños del MASTER_PLAN: reposo, foco, tooltip, modal,
ocupado, error, vacío, selección y restricciones aplicables. Revisar iconos sin
tooltip, con teclado, táctil, zoom 200 %, movimiento reducido y colores forzados.
Comparar tareas contra la referencia: jerarquía compacta, señales localizadas,
edición situada y ausencia de explicaciones repetidas; no exigir copiar sus píxeles
pequeños o fallos técnicos. Cero nuevas acciones exclusivamente por hover.

Antes y después de cada lote con compartidos, ejecutar el control de no alteración
de Partes: hashes, capturas/estados de su línea base recibida y contratos. Si cambia,
aislar el lote fuera de Partes; **no actualizar el golden ni editar el módulo para
hacerlo pasar**. Capturas antiguas son historia, no aprobación del diseño nuevo.

Rendimiento: mismos datos antes/después, sin consultas por fila ni precargar
evidencias de toda la tabla; liberar recursos. Presupuestos después de H2.
