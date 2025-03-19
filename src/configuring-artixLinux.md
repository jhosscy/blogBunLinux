---
title: "Configuración de Artix Linux"
category: "Configuración"
image: "configuracion-artixlinux.png"
---
# Configuracion de ArtixLinux
Esta se una configuracion estandar para ArtixLinux post instalacion.

## Shell Framework
En esta sección elegiremos el shell que queremos en nuestra terminal.

### Instalación de Zsh

En este caso usaremos Zim, que es un framework para Zsh. Zsh (Z Shell) es un intérprete de comandos (shell) para sistemas operativos tipo Unix que ofrece numerosas mejoras sobre el tradicional Bash, incluyendo autocompletado mejorado, corrección ortográfica, temas visuales personalizables y compatibilidad con plugins.

Para instalarlo, primero instalamos `zsh`:

```bash
sudo pacman -S zsh
```

Este comando utiliza:
- `sudo`: proporciona privilegios de administrador para instalar software en el sistema
- `pacman`: el gestor de paquetes de Arch Linux y sus derivados
- `-S`: parámetro de pacman que indica "sincronizar", es decir, instalar un paquete desde los repositorios
- `zsh`: el nombre del paquete a instalar

### Instalación de Zim

Zim es un framework para Zsh que proporciona una estructura organizada para gestionar la configuración, temas y plugins. Es conocido por ser rápido, modular y fácil de personalizar.

Para instalar Zim, podemos utilizar cualquiera de estos dos métodos:

```bash
## instalar con curl
curl -fsSL https://raw.githubusercontent.com/zimfw/install/master/install.zsh | zsh
```

Donde:
- `curl`: herramienta para transferir datos desde o hacia un servidor
- `-f`: falla silenciosamente (no muestra errores HTTP)
- `-s`: modo silencioso (no muestra barras de progreso)
- `-S`: muestra errores si fallan las operaciones
- `-L`: sigue redirecciones
- La URL: apunta al script de instalación alojado en GitHub
- `|`: operador de tubería (pipe) que redirecciona la salida al comando siguiente
- `zsh`: ejecuta el script descargado con el intérprete Zsh

Alternativamente:

```bash
## instalar con wget
wget -nv -O - https://raw.githubusercontent.com/zimfw/install/master/install.zsh | zsh
```

Donde:
- `wget`: herramienta alternativa para descargar contenido web
- `-nv`: modo no-verbose (muestra información mínima)
- `-O -`: envía el contenido descargado a la salida estándar en lugar de guardarlo como archivo
- La URL: apunta al script de instalación
- `|`: redirige la salida al intérprete Zsh

El script de instalación crea los archivos de configuración necesarios en tu directorio de inicio (~/.zim, ~/.zimrc y modifica ~/.zshrc).

### Configuración y Personalización

Para cada cambio que quieras hacer, tienes que editar el archivo **.zimrc**, que es el archivo principal de configuración de Zim donde se definen los módulos y plugins a utilizar.

El comando `zimfw` es el gestor de plugins de Zim, que se encarga de instalar, actualizar y desinstalar módulos según las especificaciones de tu archivo .zimrc.

### Cambio de Tema del Prompt

Para cambiar el tema del prompt (la línea de comandos), necesitas editar el archivo ***.zimrc*** y modificar esta línea de código:

```zimrc
# A minimal fork of subnixr's minimal prompt theme.
zmodule minimal
```

Esta línea carga el tema "minimal", que es un tema minimalista para el prompt.

El tema necesita del siguiente módulo para funcionar correctamente:

```zimrc
# Formats the current working directory to be used by prompts.
zmodule prompt-pwd
```

Este módulo `prompt-pwd` proporciona funciones para formatear y mostrar la ruta del directorio actual en el prompt, con opciones para truncar rutas largas y personalizar su visualización.

### Aplicación de Cambios

Si realizas cambios en el archivo .zimrc y no ves que se aplican inmediatamente, ejecuta:

```zsh
zimfw install
```

Este comando lee tu archivo .zimrc, instala todos los módulos especificados y actualiza tu configuración. Después, debes reiniciar tu terminal para que los cambios surtan efecto completamente.

### Limpieza de Módulos

Para eliminar los módulos que no usas (aquellos que has eliminado de tu archivo .zimrc), ejecuta:

```zsh
zimfw uninstall
```

Este comando elimina físicamente los módulos que ya no están definidos en tu .zimrc, liberando espacio y manteniendo tu configuración limpia.

### Solución de Problemas Comunes

#### Configurar Zsh como shell por defecto

Si al abrir un nuevo terminal no está Zsh establecido por defecto, puedes solucionarlo con:

```zsh
chsh -s $(which zsh)
```

Este comando:
- `chsh`: Change Shell, utilidad para cambiar el shell por defecto del usuario
- `-s`: especifica que el siguiente argumento es el nuevo shell a utilizar
- `$(which zsh)`: es una sustitución de comando que obtiene la ruta completa al ejecutable zsh (normalmente /usr/bin/zsh)

Es necesario reiniciar tu sistema después de ejecutar este comando para que el cambio de shell por defecto se aplique correctamente. Esto ocurre porque algunos entornos de escritorio y gestores de inicio de sesión cargan la información del shell predeterminado al inicio del sistema.

El cambio de shell por defecto afecta a todas las terminales nuevas que abras y se mantendrá entre reinicios del sistema, proporcionándote siempre la experiencia mejorada de Zsh con tu configuración de Zim.

## ZSH
Vamos a configurar el archivo `.zshrc` para agregar estas variables de entorno:
```.zshrc
# ------------------------------
# Custom configuration
# ------------------------------

# editor
export EDITOR=nvim
export PAGER=less
```
Define la variable de entorno EDITOR, que es utilizada por muchos programas en Unix/Linux.
Define la variable de entorno PAGER, que determina qué programa se utilizará para mostrar texto que
no cabe en una sola pantalla de terminal.

## AUR
El AUR (Arch User Repository) es un repositorio comunitario para distribuciones basadas en Arch Linux
(como Manjaro o Artix) que permite instalar software no incluido en los repositorios oficiales.
Su funcionamiento se basa en PKGBUILDs, scripts que automatizan la compilación e instalación de paquetes
usando `makepkg`.

### Yaourtix: Asistente para AUR en Artix Linux

El paquete Yaourtix es un asistente personalizado para manejar paquetes del AUR (Arch User Repository)
adaptado específicamente para Artix Linux. Es una versión modificada de Yaourt (Yet Another User Repository Tool),
diseñada para garantizar compatibilidad con los repositorios oficiales de Artix y evitar conflictos con `systemd`.

### Instalación de Yaourtix

Para instalar Yaourtix, ejecuta el siguiente comando:

```zsh
sudo pacman -S yaourtix
```

El sistema descargará e instalará Yaourtix junto con sus dependencias necesarias, que pueden incluir:
- `pacman` (gestor de paquetes principal)
- `curl` o `wget` (para descargar paquetes de AUR)
- `git` (para clonar repositorios AUR cuando sea necesario)
- `base-devel` (grupo de paquetes necesarios para compilar software)

### Configuración de Yaourtix

Para configurar Yaourtix, necesitas crear un archivo de configuración personalizado:

```zsh
touch .yaourtrc
```

El comando `touch` crea un archivo vacío llamado `.yaourtrc` en tu directorio home (`~`). Este archivo comienza con un punto (`.`), lo que lo hace oculto en sistemas Unix/Linux. Yaourtix buscará automáticamente este archivo para cargar la configuración personalizada.

Después, agrega el siguiente contenido con tu editor favorito, en este caso `nvim`:

```
# Environment variables
EDITOR="$EDITOR"

# Output
USECOLOR=1
USEPAGER=1

# Command
DIFFEDITCMD="diff"
```

Explicación detallada de cada opción:

1. **Environment variables**:
   - `EDITOR="$EDITOR"`: Define el editor que utilizará Yaourtix para modificar los PKGBUILDs. Esta configuración toma el valor de la variable de entorno `$EDITOR` del sistema. Si tienes configurado, por ejemplo, `$EDITOR=nvim`, entonces Yaourtix utilizará nvim para editar archivos.

2. **Output**:
   - `USECOLOR=1`: Habilita la salida coloreada en la terminal para facilitar la lectura de información. Los valores posibles son:
     - `0`: Desactiva los colores
     - `1`: Activa los colores (pero se desactivan automáticamente si la salida no es una terminal)
     - `2`: Fuerza la salida en color incluso si no es una terminal
   - `USEPAGER=1`: Activa el uso de un paginador (como `less` o `more`) cuando la salida es extensa, para permitir desplazarse por ella fácilmente. Utiliza la variable de entorno `$PAGER` para determinar qué paginador usar.

3. **Command**:
   - `DIFFEDITCMD="diff"`: Especifica el comando que se utilizará para mostrar diferencias entre archivos cuando sea necesario revisar cambios en PKGBUILDs u otros archivos de configuración. En este caso usa el comando `diff` estándar, pero podría configurarse para usar herramientas más avanzadas como `vimdiff`, `meld` o `kdiff3`.

Esta configuración básica ofrece una experiencia de usuario mejorada al utilizar Yaourtix, facilitando la interacción con el sistema y mejorando la legibilidad de la información. El archivo de configuración permite numerosas opciones adicionales no incluidas en este ejemplo, como la gestión automática de respaldos de archivos de configuración, comportamiento durante actualizaciones, y opciones de interacción con AUR.

Yaourtix utiliza esta configuración para personalizar su comportamiento cada vez que se ejecuta, mejorando así la experiencia de compilación e instalación de paquetes desde AUR en Artix Linux.

## Configurar la reasignación de teclas para linux
Esta guia detalla el proceso para configurar la reasignación de teclas en sistemas Linux utilizando el demonio `keyd`. Esta solución es especialmente útil cuando se requiere reemplazar la funcionalidad de teclas defectuosas o cuando se desea personalizar el comportamiento del teclado para mejorar la productividad.
Primero, clone el repositorio oficial de `keyd` desde GitHub:

```zsh
git clone https://github.com/rvaiya/keyd
cd keyd
```

Compile e instale el software ejecutando los siguientes comandos:

```zsh
make && sudo make install
```

Cree o edite el archivo de configuración principal ubicado en `/etc/keyd/default.conf`:

```zsh
sudo mkdir -p /etc/keyd
sudo nvim /etc/keyd/default.conf
```

Inserte el siguiente contenido en el archivo de configuración para establecer un ejemplo de reasignación:

```conf
[ids]

*

[alt]

; = z

[control+alt]

; = Z
```

Esta configuración de ejemplo:
- Se aplica a todos los dispositivos de entrada (`*`)
- Reasigna la tecla punto y coma (`;`) a la letra `z` cuando se presiona con la tecla Alt
- Reasigna la tecla punto y coma (`;`) a la letra `Z` (mayúscula) cuando se presiona con las teclas Control+Alt

Si su sistema utiliza Dinit como gestor de servicios, siga estos pasos:

1. Cree un archivo de servicio para Keyd:

```zsh
sudo nvim /etc/dinit.d/keyd
```

2. Agregue la siguiente configuración:

```
type = process
command = /usr/local/bin/keyd
```

3. Habilite el servicio para que se inicie automáticamente:

```zsh
sudo dinitctl enable keyd
```

Para aplicar los cambios realizados en la configuración sin reiniciar el sistema, ejecute:

```zsh
sudo keyd reload
```

## Fonts
### <u>Jetbrains Mono Nerd</u>
JetBrains Mono Nerd es una versión del tipo de letra JetBrains Mono, que ha sido mejorada con una colección de iconos y símbolos específicos para desarrolladores, conocidos como "Nerd Fonts". Estas adiciones hacen que JetBrains Mono Nerd sea especialmente útil en entornos de desarrollo y terminales, ofreciendo una amplia gama de iconos de herramientas, lenguajes de programación, y sistemas de control de versiones, entre otros, directamente en la tipografía.
Para instalar ejecutar el siguiente comando:
```zsh
sudo pacman -S ttf-jetbrains-mono-nerd
```
y luego puedes usarlo en la configuración de tu terminal favorito.

## Browser
En esta sección instalaremos Brave Browser, un navegador centrado en la privacidad y basado en Chromium, utilizando la versión nightly (desarrollo nocturno) que contiene las funcionalidades más recientes.
```zsh
yaourt -S brave-nightly-bin
```

Para aprovechar las ventajas del protocolo de visualización Wayland (mejor rendimiento, seguridad y compatibilidad con pantallas HiDPI), ejecutamos Brave con parámetros específicos:

```zsh
brave-nightly --ozone-platform=wayland
```

**Explicación del comando:**
- `brave-nightly`: Ejecutable principal del navegador Brave en su versión nightly.
- `--ozone-platform=wayland`: Este parámetro configura Brave para utilizar la plataforma Ozone con el backend de Wayland, en lugar del tradicional X11.
