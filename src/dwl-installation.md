---
title: "Instalación de DWL en Wayland"
category: "Instalación"
image: "instalacion-dwl.png"
---
# Instalación del compositor DWL para Wayland

## Requisitos previos

Antes de comenzar, asegúrate de que tu sistema tenga instaladas las herramientas de compilación y las dependencias
necesarias para compilar dwl. Según el Readme, las dependencias básicas son:

1. Dependencias de compilación:
  - pkg-config: Herramienta que proporciona una interfaz unificada para obtener información sobre las bibliotecas instaladas en el sistema. Es esencial para el proceso de compilación ya que permite al sistema de construcción localizar correctamente las dependencias y sus rutas.

2. Librerías y componentes requeridos:
  - libinput: Biblioteca que maneja la entrada de dispositivos como teclados, ratones y touchpads. Proporciona una capa de abstracción uniforme para que los compositores Wayland puedan interpretar y manejar eventos de entrada.
  - wayland: Protocolo de visualización y biblioteca cliente que reemplaza al sistema X Window. Proporciona una comunicación más directa entre aplicaciones y el compositor, lo que resulta en un mejor rendimiento y seguridad.
  - wlroots: Biblioteca modular que implementa gran parte de la funcionalidad de un compositor Wayland. Gestiona las pantallas, entradas, y otras funcionalidades básicas que los compositores necesitan.
  - libxkbcommon: Biblioteca que maneja la configuración de teclado, mapeo de teclas y conversión de códigos de teclas en caracteres, esencial para la interpretación correcta de entradas de teclado.
  - wayland-protocols: Colección de protocolos adicionales de Wayland que extienden la funcionalidad básica, permitiendo características como ventanas emergentes, arrastrar y soltar, etc.

Instala estos paquetes con pacman, ejecutando el siguiente comando:

```bash
sudo pacman -S pkg-config libinput wayland wlroots libxkbcommon wayland-protocols
```

Este comando utiliza el gestor de paquetes pacman (nativo de Arch Linux y derivados) para instalar todas las dependencias necesarias. El parámetro `-S` indica la operación de sincronización y instalación de paquetes desde los repositorios.

## Clonar el Repositorio y Configurar DWL

Ejecuta el siguiente comando para clonar el repositorio con la rama '0.7' semi-estable:

```bash
git clone -b 0.7 https://codeberg.org/dwl/dwl.git
cd dwl
```

Este comando hace lo siguiente:
- `git clone`: Descarga una copia del repositorio remoto a tu máquina local
- `-b 0.7`: Especifica que se debe clonar la rama '0.7' en lugar de la rama principal. Se utiliza esta rama porque es considerada semi-estable, lo que significa que tiene menos probabilidades de contener errores críticos que la rama principal de desarrollo.
- `https://codeberg.org/dwl/dwl.git`: La URL del repositorio. Codeberg es una plataforma alternativa a GitHub que aloja proyectos de código abierto.
- `cd dwl`: Cambia el directorio actual al directorio recién clonado del proyecto dwl.

dwl sigue la filosofía de suckless, por lo que la configuración se realiza mediante la edición del archivo `config.h`. La filosofía suckless promueve software minimalista, eficiente y que se configura mediante la modificación directa del código fuente en lugar de archivos de configuración externos. Esto permite una personalización más profunda pero requiere recompilar el programa después de cada cambio.

Si deseas modificar atajos, colores o la apariencia (por ejemplo, el color de fondo, que por defecto es negro), edita el archivo:

```bash
nvim config.h
```

Este comando abre el archivo `config.h` en el editor de texto Neovim (nvim). El archivo `config.h` contiene toda la configuración precompilada de dwl, incluyendo atajos de teclado, colores, disposición y comportamiento de las ventanas.

## Personalización de DWL

Lo primero que haremos es configurar nuestra terminal, en este caso instalaremos `alacritty`:

```bash
sudo pacman -S alacritty
```

Alacritty es un emulador de terminal acelerado por GPU y centrado en el rendimiento. Es particularmente adecuado para Wayland ya que está diseñado con soporte nativo para este protocolo. El comando instala Alacritty usando pacman, donde:
- `sudo`: Ejecuta el comando con privilegios de administrador
- `pacman`: El gestor de paquetes
- `-S`: Operación de instalación
- `alacritty`: Nombre del paquete a instalar

Y configuramos el archivo config.h con las siguientes modificaciones:

```h
/* commands */
static const char *termcmd[] = { "alacritty", NULL };
```

Esta modificación define el comando que se ejecutará cuando se active el atajo para abrir una terminal. La estructura es un array de cadenas donde:
- El primer elemento (`"alacritty"`) es el nombre del ejecutable
- `NULL` marca el final del array de argumentos (siguiendo la convención de C para la función exec)

Para activarlo solamente utiliza la siguiente combinación de teclas `ALT+SHIFT+ENTER`. Esta es la combinación de teclas predeterminada en dwl (heredada de dwm) para abrir la terminal configurada.

Configuramos el menú para lanzar aplicaciones usando el paquete `bemenu` para Wayland:

```bash
sudo pacman -S bemenu
```

Bemenu es un lanzador de aplicaciones minimalista diseñado específicamente para Wayland. Es similar a dmenu (usado comúnmente en X11) pero con soporte nativo para el protocolo Wayland. El comando instala bemenu usando pacman con los mismos parámetros explicados anteriormente.

Y configuramos el archivo config.h con las siguientes modificaciones:

```h
static const char *menucmd[] = { "bemenu-run", NULL };
```

Esta línea define el comando para el lanzador de aplicaciones. `bemenu-run` es el ejecutable que muestra un menú de aplicaciones disponibles y las ejecuta cuando son seleccionadas. El `NULL` marca el final de los argumentos, al igual que en la configuración de la terminal.

Para activarlo solamente utiliza la siguiente combinación de teclas `ALT+p`. Este es el atajo predeterminado en dwl para invocar el menú de aplicaciones.

Configuramos la distribución del teclado con las siguientes modificaciones:

```h
/* keyboard */
static const struct xkb_rule_names xkb_rules = {
	.layout = "us",
	.variant = "dvorak",
	.options = NULL,
};
```

Esta configuración establece la disposición del teclado mediante la biblioteca libxkbcommon:
- `.layout = "us"`: Define el diseño base del teclado como estadounidense
- `.variant = "dvorak"`: Especifica la variante Dvorak, que es una disposición alternativa diseñada para aumentar la eficiencia y reducir la fatiga al escribir (a diferencia del estándar QWERTY)
- `.options = NULL`: No se aplican opciones adicionales para la configuración del teclado

Con esto tenemos la distribución Dvorak cuando lancemos dwl. Esta configuración solo afecta a las aplicaciones ejecutadas dentro de la sesión de dwl.

Configuramos el borde de nuestras ventanas con las siguientes modificaciones:

```h
static const unsigned int borderpx         = 0;  /* border pixel of windows */
```

Esta línea establece el ancho del borde de las ventanas en píxeles:
- `borderpx = 0`: Establece el borde de las ventanas a 0 píxeles, lo que significa que no habrá bordes visibles entre ventanas. Esto da un aspecto más minimalista a la interfaz. Si quisieras tener bordes visibles, podrías establecer este valor a 1 o más.

Estos son los cambios mínimos que haremos. Hay muchas más opciones disponibles en `config.h` para personalizar el comportamiento de dwl, como barras de estado, asignación de áreas de trabajo, reglas para aplicaciones específicas, etc.

## Compilación de DWL

A diferencia de algunos proyectos modernos que usan Meson/Ninja, dwl se compila con un Makefile sencillo. Ejecuta:

```bash
make
```

El comando `make` lee el archivo Makefile en el directorio actual y ejecuta las reglas de compilación definidas en él. El proceso:
1. Compila los archivos fuente (.c) a archivos objeto (.o)
2. Enlaza estos objetos con las bibliotecas necesarias (wayland, wlroots, etc.)
3. Genera el ejecutable final `dwl`

Make es una herramienta de automatización de compilación que determina automáticamente qué partes de un programa deben recompilarse, según los archivos que han cambiado.

Si la compilación se completa sin errores y deseas instalar dwl de forma global (para poder ejecutarlo sin tener que estar en el directorio del repositorio), ejecuta:

```bash
sudo make install
```

Este comando:
- `sudo`: Ejecuta el comando con privilegios de administrador (necesario para escribir en directorios del sistema)
- `make install`: Ejecuta la regla "install" del Makefile, que normalmente copia el ejecutable compilado a `/usr/local/bin/` para que esté disponible en toda la sesión del sistema

La instalación global permite invocar dwl desde cualquier ubicación en el terminal, y también facilita su integración con gestores de inicio de sesión gráficos como SDDM o LightDM.

## Creación de script

Vamos a crear un script para poder configurar correctamente las variables de entorno para Wayland, también para iniciar la sesión D-Bus y por último agregar una imagen de fondo:

Crearemos un script con el siguiente nombre:

```bash
touch dwl-session.sh
```

El comando `touch` crea un archivo vacío llamado `dwl-session.sh`. Este será nuestro script de sesión que configurará el entorno y lanzará dwl con los componentes adicionales.

Agregaremos las variables de entorno:

```sh
#!/bin/sh
# Configurar entorno
export XDG_RUNTIME_DIR=/tmp/$(id -u)-runtime-dir
mkdir -p $XDG_RUNTIME_DIR
chmod 700 $XDG_RUNTIME_DIR
```

Esta sección del script:
- `#!/bin/sh`: Conocido como "shebang", indica que este script debe ser interpretado por el intérprete de comandos sh.
- `export XDG_RUNTIME_DIR=/tmp/$(id -u)-runtime-dir`: Establece y exporta la variable de entorno XDG_RUNTIME_DIR, que es esencial para Wayland. Esta variable apunta a un directorio temporal donde las aplicaciones Wayland almacenan archivos de socket y otros archivos temporales.
  - `$(id -u)` obtiene el ID de usuario actual, lo que hace que el directorio sea único para cada usuario
- `mkdir -p $XDG_RUNTIME_DIR`: Crea el directorio especificado en XDG_RUNTIME_DIR. La opción `-p` asegura que se crean todos los directorios padres si no existen.
- `chmod 700 $XDG_RUNTIME_DIR`: Establece los permisos del directorio a 700 (lectura, escritura y ejecución solo para el propietario), lo cual es un requisito de seguridad para XDG_RUNTIME_DIR.

Ahora iniciamos la sesión D-Bus:

```sh
# Iniciar D-Bus
dbus-daemon --session --address=unix:path=$XDG_RUNTIME_DIR/bus --nofork --print-address > $XDG_RUNTIME_DIR/dbus-address &
DBUS_PID=$!
export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus
```

Esta sección:
- Inicia el demonio D-Bus, que es un sistema de comunicación entre procesos utilizado por muchas aplicaciones modernas para intercambiar mensajes.
  - `--session`: Inicia una instancia de sesión de D-Bus (para el usuario actual) en lugar de una instancia de sistema
  - `--address=unix:path=$XDG_RUNTIME_DIR/bus`: Especifica la ubicación del socket de D-Bus en el directorio de tiempo de ejecución
  - `--nofork`: Evita que el demonio se bifurque en segundo plano (útil para scripts)
  - `--print-address`: Imprime la dirección del bus, que se redirige al archivo dbus-address
  - `&`: Ejecuta el comando en segundo plano
- `DBUS_PID=$!`: Guarda el PID (ID de proceso) del demonio D-Bus recién iniciado
- `export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus`: Establece y exporta la variable que las aplicaciones utilizarán para conectarse al bus D-Bus

Ahora ejecutamos el comando `dwl`:

```sh
exec dwl &
```

Este comando:
- `exec`: Reemplaza el proceso actual (el shell) con el comando especificado
- `dwl`: El compositor Wayland que acabamos de compilar
- `&`: Ejecuta dwl en segundo plano, permitiendo que el script continúe ejecutándose

Es importante ejecutar dwl en segundo plano para poder lanzar otros programas después, como el fondo de pantalla.

Ahora instalamos el paquete `swaybg` con el siguiente comando:

```bash
sudo pacman -S swaybg
```

Swaybg es una utilidad simple que establece fondos de pantalla en compositores Wayland compatibles con wlroots (como dwl). El comando instala swaybg usando pacman, con parámetros similares a los ya explicados.

Y ahora ejecutamos el comando `swaybg` con un retraso de 1.5 segundos para esperar que se inicie dwl y esto no genere un error:

```sh
sleep 1.5

swaybg -i ~/Downloads/*.jpg -m fill &
```

Esta sección:
- `sleep 1.5`: Pausa la ejecución del script durante 1.5 segundos. Esto es necesario para dar tiempo a dwl para inicializarse completamente antes de intentar establecer el fondo de pantalla.
- `swaybg`: El programa para establecer fondos de pantalla
  - `-i ~/Downloads/*.jpg`: Especifica la imagen a usar como fondo. La ruta `~/Downloads/*.jpg` se refiere a un archivo que el usuario elija en el directorio de Descargas.
  - `-m fill`: Define el modo de visualización. "fill" hace que la imagen llene completamente la pantalla, posiblemente recortando partes de la imagen para mantener la relación de aspecto.
  - `&`: Ejecuta el comando en segundo plano para que no bloquee el script.

Aquí tienes el archivo completo de `dwl-session.sh`:

```sh
#!/bin/sh
# Configurar entorno
export XDG_RUNTIME_DIR=/tmp/$(id -u)-runtime-dir
mkdir -p $XDG_RUNTIME_DIR
chmod 700 $XDG_RUNTIME_DIR

# Iniciar D-Bus
dbus-daemon --session --address=unix:path=$XDG_RUNTIME_DIR/bus --nofork --print-address > $XDG_RUNTIME_DIR/dbus-address &
DBUS_PID=$!
export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus

exec dwl &

sleep 1.5

swaybg -i ~/Downloads/screen.jpg -m fill &
```

Este script completo configura un entorno mínimo para ejecutar dwl con una imagen de fondo. Es particularmente útil cuando se inicia dwl directamente desde una consola virtual (TTY) sin un gestor de inicio de sesión gráfico.

Hacemos el script ejecutable con el siguiente comando:

```bash
chmod +x dwl-session.sh
```

El comando `chmod` modifica los permisos de un archivo:
- `+x`: Agrega el permiso de ejecución (x) al archivo, permitiendo que se ejecute como un programa
- `dwl-session.sh`: El archivo al que aplicamos el cambio de permisos

Sin este paso, el sistema trataría el archivo como un texto normal y no como un script ejecutable.

Ejecutamos el script:

```bash
./dwl-session.sh
```

El `./` indica que el script está en el directorio actual. Este comando inicia todo el proceso:
1. Configura las variables de entorno necesarias
2. Inicia D-Bus para la comunicación entre aplicaciones
3. Lanza el compositor dwl
4. Establece una imagen de fondo después de un breve retraso

Esto sería todo y debería funcionar correctamente. Una vez ejecutado, tendrás un entorno dwl funcional con soporte para aplicaciones Wayland, una imagen de fondo personalizada y los atajos de teclado configurados para lanzar la terminal Alacritty y el menú de aplicaciones bemenu.
