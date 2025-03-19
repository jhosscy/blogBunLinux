---
title: "Instalación de PipeWire en ArtixLinux"
category: "Instalación"
image: "instalacion-pipewire.png"
---
# Instalar pipewire en ArtixLinux
Esta es una guía para instalar y ejecutar pipewire para tener sonido en nuestro sistema ArtixLinux. A continuación, se detalla cada paso del proceso.

## Instalación de PipeWire y componentes relacionados

Ejecutamos el siguiente comando para instalar los paquetes necesarios:
```bash
sudo pacman -S pipewire pipewire-alsa wireplumber
```

### Explicación detallada de los paquetes:

- **pipewire**: Es un servidor multimedia moderno diseñado para manejar audio y video en sistemas Linux. Funciona como reemplazo de PulseAudio y JACK, ofreciendo baja latencia y mejor rendimiento. Proporciona una API para comunicarse con aplicaciones y gestionar recursos multimedia.

- **pipewire-alsa**: Este es un módulo que permite la compatibilidad entre ALSA (Advanced Linux Sound Architecture) y PipeWire. Hace que las aplicaciones que utilizan ALSA para audio puedan funcionar correctamente con PipeWire, redirigiendo las entradas/salidas de audio de ALSA a PipeWire.

- **wireplumber**: Es el administrador de sesiones predeterminado para PipeWire. Se encarga de gestionar los dispositivos de audio, configurar las fuentes y sumideros de audio, y controlar cómo se enrutan los streams de audio entre aplicaciones y hardware. Reemplaza al gestor de sesiones más simple que viene con PipeWire.

## Agregar a nuestro script de inicialización

Ahora vamos a agregar estos comandos a nuestro script de inicialización para que PipeWire se inicie correctamente cada vez que iniciamos el sistema:

```sh
# Iniciar audio
pipewire &

sleep 2.5

wireplumber &
```

### Explicación detallada:

- **pipewire &**: Inicia el servidor PipeWire en segundo plano (el símbolo `&` hace que se ejecute en background). Este comando arranca el servicio principal que manejará todas las entradas y salidas de audio.

- **sleep 2.5**: Pausa el script durante 2.5 segundos. Este retraso es necesario para asegurar que PipeWire tenga tiempo suficiente para inicializarse completamente antes de lanzar WirePlumber. Sin este retraso, podría haber problemas de temporización donde WirePlumber intente conectarse a un servidor PipeWire que aún no está completamente operativo.

- **wireplumber &**: Inicia el gestor de sesiones WirePlumber en segundo plano. Este servicio se conectará al servidor PipeWire y comenzará a gestionar dispositivos y conexiones de audio.

El archivo completo nos quedaría así:
```bash
#!/bin/sh
# Configurar entorno
export XDG_RUNTIME_DIR=/tmp/$(id -u)-runtime-dir
mkdir -p $XDG_RUNTIME_DIR
chmod 700 $XDG_RUNTIME_DIR

# Iniciar D-Bus
dbus-daemon --session --address=unix:path=$XDG_RUNTIME_DIR/bus --nofork --print-address > $XDG_RUNTIME_DIR/dbus-address &
DBUS_PID=$!
export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus

# Iniciar audio
pipewire &

sleep 2.5

wireplumber &

exec dwl &

sleep 1.5

swaybg -i ~/Downloads/screen.jpg -m fill &
```

## Configurar DWL con pipewire

Ahora vamos a configurar el archivo `config.h` para agregar teclas personalizables para bajar, subir y mutear el volumen:

```h
/* comandos para control de volumen */
static const char *volup[] = { "/bin/sh", "-c", "wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+", NULL };
static const char *voldown[] = { "/bin/sh", "-c", "wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-", NULL };
static const char *volmute[] = { "/bin/sh", "-c", "wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle", NULL };
```

### Explicación detallada de los comandos para control de volumen:

- **volup**: Define un comando para aumentar el volumen.
  - `/bin/sh`: Ejecuta el shell.
  - `-c`: Indica que el siguiente argumento es un comando a ejecutar.
  - `wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+`: Utiliza la herramienta `wpctl` (parte de WirePlumber) para aumentar el volumen del dispositivo de salida de audio predeterminado en un 5%. `@DEFAULT_AUDIO_SINK@` es una macro especial que hace referencia al dispositivo de salida (altavoz/auriculares) actualmente predeterminado.
  - `NULL`: Marca el final del array de argumentos.

- **voldown**: Define un comando para disminuir el volumen.
  - Los parámetros son similares a `volup`, pero con `5%-` para reducir el volumen en un 5%.

- **volmute**: Define un comando para activar/desactivar el silencio.
  - Usa `wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle` para cambiar el estado de silencio del dispositivo predeterminado. El parámetro `toggle` hace que alterne entre silenciado y no silenciado.

También agregamos esto en las combinaciones de teclas para que funcione correctamente:

```sh
static const Key keys[] = {
  /* Teclas de control de volumen */
  { 0, XKB_KEY_XF86AudioRaiseVolume, spawn, {.v = volup } },
  { 0, XKB_KEY_XF86AudioLowerVolume, spawn, {.v = voldown } },
  { 0, XKB_KEY_XF86AudioMute, spawn, {.v = volmute } },
};
```

### Explicación detallada de la configuración de teclas:

- **{ 0, XKB_KEY_XF86AudioRaiseVolume, spawn, {.v = volup } }**: 
  - El primer `0` significa que no se necesita ninguna tecla modificadora (como Ctrl, Alt, etc.).
  - `XKB_KEY_XF86AudioRaiseVolume` es la tecla de subir volumen en el teclado (normalmente una tecla multimedia).
  - `spawn` es la función que se invocará, que lanza un comando externo.
  - `{.v = volup }` es el argumento para `spawn`, que especifica qué comando ejecutar (el array `volup` definido anteriormente).

- **{ 0, XKB_KEY_XF86AudioLowerVolume, spawn, {.v = voldown } }**: Similar al anterior, pero asociado a la tecla de bajar volumen.

- **{ 0, XKB_KEY_XF86AudioMute, spawn, {.v = volmute } }**: Similar a los anteriores, pero asociado a la tecla de silencio.

## Verificación de la configuración

Para comprobar que todo funciona correctamente ejecuta el comando:

```bash
wpctl status
```

Este comando muestra el estado actual de PipeWire y WirePlumber, incluyendo:
- Los dispositivos de entrada y salida disponibles
- Los clientes conectados al servidor
- Los niveles de volumen y estados de silencio
- Las conexiones entre fuentes y dispositivos

Si todo está configurado correctamente, deberías ver información sobre tu servidor PipeWire, los dispositivos de audio disponibles y sus estados. 

También puedes probar el sistema de audio de otras formas:
- Reproduciendo un archivo de audio con un reproductor como `mpv` o `vlc`
- Utilizando tu navegador para reproducir contenido multimedia en línea
- Utilizando un comando simple como `paplay /usr/share/sounds/alsa/Front_Center.wav` (si tienes instalado el paquete alsa-utils)

Las teclas de control de volumen deberían responder inmediatamente, y podrás ver los cambios si ejecutas `wpctl status` después de usarlas.
