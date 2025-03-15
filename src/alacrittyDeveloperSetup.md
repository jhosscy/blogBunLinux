# Alacritty: Guía de Configuración para Desarrolladores

## Introducción

Alacritty es un emulador de terminal de alto rendimiento desarrollado en Rust. Su diseño minimalista, aceleración GPU a través de OpenGL y enfoque en la velocidad lo convierten en una herramienta eficiente para desarrolladores que buscan un terminal rápido y altamente personalizable.

## Instalación

### ArchLinux/ArtixLinux
```bash
sudo pacman -S alacritty
```

## Configuración

Alacritty utiliza TOML para su configuración. A diferencia de otros terminales, Alacritty no crea un archivo de configuración por defecto, por lo que deberá crearlo manualmente.

### Ubicación del archivo de configuración

- **Linux/BSD**: 
  - `$XDG_CONFIG_HOME/alacritty/alacritty.toml`
  - `$HOME/.config/alacritty/alacritty.toml`

### Creación del archivo de configuración

```bash
mkdir -p ~/.config/alacritty
touch ~/.config/alacritty/alacritty.toml
```

## Configuración Detallada

A continuación se presenta una configuración optimizada para desarrolladores con explicaciones detalladas de cada sección.

```toml
[window]
decorations = "Full"
opacity = 0.5
padding = { x = 2, y = 2 }

[scrolling]
history = 10000
multiplier = 6

[font]
size = 14

[font.normal]
family = "JetBrainsMono NF Light"
style = "italic"

[colors]
draw_bold_text_with_bright_colors = true
transparent_background_colors = false
line_indicator = { foreground = "None", background = "None" }
footer_bar = { foreground = "#181a1f", background = "#abb2bf" }
selection = { text = "CellBackground", background = "CellForeground" }

[colors.primary]
foreground = "#abb2bf"
background = "#000000"
dim_foreground = "#848b98"
bright_foreground = "None"

[colors.cursor]
text = "CellBackground"
cursor = "CellForeground"

[colors.vi_mode_cursor]
text = "CellBackground"
cursor = "CellForeground"

[colors.search]
matches = { foreground = "#181a1f", background = "#e86671" }
focused_match = { foreground = "#181a1f", background = "#e5c07b" }

[colors.hints]
start = { foreground = "#181a1f", background = "#e5c07b" }
end = { foreground = "#181a1f", background = "#e86671" }

[colors.normal]
black = "#181a1f"
red = "#e86671"
green = "#98c379"
yellow = "#e5c07b"
blue = "#61afef"
magenta = "#c678dd"
cyan = "#56b6c2"
white = "#abb2bf"

[colors.bright]
black = "#5c6370"
red = "#e86671"
green = "#98c379"
yellow = "#e5c07b"
blue = "#61afef"
magenta = "#c678dd"
cyan = "#56b6c2"
white = "#f8f8f8"

[colors.dim]
black = "#21252b"
red = "#993939"
green = "#31392b"
yellow = "#93691d"
blue = "#1c3448"
magenta = "#8a3fa0"
cyan = "#2b6f77"
white = "#848b98"

[selection]
save_to_clipboard = true

[cursor.style]
shape = "Beam"

[mouse]
hide_when_typing = true
```

## Explicación detallada de la configuración

### Sección [window]

Esta sección controla la apariencia y comportamiento de la ventana del terminal.

- **decorations**: Define el estilo de decoración de la ventana.
  - `"Full"`: Bordes y barra de título (estándar).

- **opacity**: Nivel de transparencia de la ventana (0.0-1.0). Útil para ver referencias detrás del terminal.

- **padding**: Agrega un espacio en blanco de 2 píxeles alrededor del contenido de la terminal, tanto horizontal (x) como verticalmente (y).

### Sección [scrolling]

Controla el comportamiento del desplazamiento del terminal.

- **history**: Número máximo de líneas almacenadas en el búfer. Un valor alto (10000) permite acceder a comandos y resultados antiguos sin perder información.

- **multiplier**: Factor de velocidad del desplazamiento. Un valor de 6 permite un desplazamiento más rápido, ahorrando tiempo al revisar salidas extensas.

### Sección [font]

Configura la tipografía del terminal.

- **size**: Tamaño de fuente en puntos. El valor 14 ofrece buena legibilidad en monitores de alta resolución.

- **font.normal**: Configura la fuente principal.
  - `family`: "JetBrainsMono NF Light" es una fuente optimizada para código con soporte para ligaduras y Nerd Fonts.
  - `style`: "italic" da un estilo distinguible para mejor diferenciación visual del código.

### Sección [colors]

Define toda la paleta de colores del terminal. Una configuración de colores bien elegida reduce la fatiga visual y mejora la productividad.

- **draw_bold_text_with_bright_colors**: Al activarlo, el texto en negrita usa automáticamente colores brillantes, mejorando la distinción visual.

- **transparent_background_colors**: Cuando es `false`, solo el fondo general es transparente, no cada celda individual.

- **colors.primary**: Colores fundamentales del terminal.
  - `foreground`: Color del texto principal (#abb2bf, un gris claro).
  - `background`: Color de fondo principal (#000000, negro).
  - `dim_foreground`: Color del texto atenuado, usado en contextos menos relevantes.

- **colors.cursor**: Colores del cursor de texto. 
  - `"CellBackground"` y `"CellForeground"` invierten automáticamente los colores donde se sitúa el cursor.

- **colors.normal** y **colors.bright**: Paletas ANSI estándar y brillante, respectivamente. Son esenciales para la representación correcta de herramientas CLI con color.

### Sección [selection]

- **save_to_clipboard**: Cuando es `true`, el texto seleccionado se copia automáticamente al portapapeles del sistema, ahorrando el paso adicional de copiar explícitamente.

### Sección [cursor.style]

- **shape**: "Beam" (línea vertical) facilita la ubicación precisa del cursor en código denso.

### Sección [mouse]

- **hide_when_typing**: Oculta automáticamente el cursor del ratón al escribir, evitando distracciones visuales durante la programación intensiva.

### Sección [keyboard]
La sección `[keyboard]` contiene un único campo principal, `bindings`, que es un array de mapeos de teclas. Cada mapeo es un objeto con varios campos posibles que definen:
1. Qué tecla está siendo configurada
2. Qué modificadores deben presionarse junto con ella
3. En qué modo del terminal debe estar activo este atajo
4. Qué acción se debe ejecutar cuando se active

Analicemos cada campo:
- **`key = "N"`**: 
  - Especifica la tecla principal que activará este atajo (en este caso, la letra "N")
  - Alacritty distingue entre mayúsculas y minúsculas, por lo que "N" y "n" serían diferentes
  - Para teclas especiales, se utilizan nombres como "F1", "Space", "Return", "Escape", etc.

- **`mods = "Control|Shift"`**: 
  - Define los modificadores que deben presionarse simultáneamente con la tecla principal
  - En este caso, se requiere tanto "Control" como "Shift" (es decir, Ctrl+Shift+N)
  - El carácter "|" se utiliza para combinar múltiples modificadores
  - Los modificadores disponibles son:
    - `Control` (tecla Ctrl)
    - `Shift` (tecla Mayúsculas)
    - `Alt` (tecla Alt, conocida como Option en macOS)
    - `Super` (tecla Windows en Windows, tecla Command en macOS)
    - `Command` (específico para macOS, equivalente a Super)
    - `Option` (específico para macOS, equivalente a Alt)

- **`action = "CreateNewWindow"`**: 
  - Especifica qué acción debe ejecutarse cuando se activa el atajo
  - `CreateNewWindow` crea una nueva ventana de Alacritty independiente
  - Este es uno de los muchos tipos de acciones predefinidas disponibles

## Conclusión

Esta configuración proporciona un equilibrio óptimo entre rendimiento, estética y funcionalidad para desarrolladores. Alacritty destaca por su velocidad y eficiencia, características cruciales para flujos de trabajo de desarrollo intensivo.

Puede personalizar aún más su configuración consultando la documentación oficial o el archivo de referencia `alacritty.toml` para adaptar el terminal a sus necesidades específicas.
