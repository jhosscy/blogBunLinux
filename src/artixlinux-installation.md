---
title: "Instalación mínima de ArtixLinux"
category: "Instalación"
image: "instalacion-minima.png"
---
# Instalación

Esta es una guía básica pero práctica para una instalación muy mínima de ArtixLinux sin systemd y sin entorno gráfico.

Lo primero que haremos es visitar el siguiente link [artixlinux.org/download.php](https://artixlinux.org/download.php) para descargar una imagen .iso de ArtixLinux. Allí puedes elegir entre varias opciones; en esta guía usaremos la siguiente .iso:  
`artix-base-dinit-*-x86_64.iso`  
La imagen está preparada para usar **dinit** en lugar de systemd. Una vez descargado, flashearemos un USB con la imagen .iso para convertirlo en un Live USB. Asegúrate de que el USB sea nuevo o no contenga información importante.

### Flasheo del USB

```bash
sudo dd if=path/*.iso of=/dev/sdX bs=4M status=progress && sync
```

**Explicación detallada:**

- **sudo:** Ejecuta el comando con privilegios de superusuario, necesarios para escribir en dispositivos de bloque.
- **dd:** Es una herramienta de bajo nivel para copiar y convertir archivos.  
  - **if=path/*.iso:** Especifica el archivo de entrada (input file). Aquí se usa un comodín para elegir la imagen .iso descargada.
  - **of=/dev/sdX:** Indica el archivo de salida (output file), que en este caso es el dispositivo USB. Se debe reemplazar `sdX` por la letra asignada a tu USB (por ejemplo, `/dev/sdb`).
  - **bs=4M:** Establece el tamaño del bloque en 4 megabytes, lo que permite copiar datos en bloques grandes para acelerar el proceso.
  - **status=progress:** Muestra el progreso durante la copia.
- **&& sync:** El operador `&&` ejecuta el comando `sync` solo si el anterior terminó correctamente.  
  - **sync:** Fuerza la escritura de los datos pendientes en el dispositivo, asegurando que la imagen se haya escrito completamente antes de desconectar el USB.

---

Una vez hecho esto, reinicia tu dispositivo con el Live USB conectado. Al arrancar, presiona la tecla correspondiente para acceder a la BIOS. Dentro de la BIOS, elige arrancar desde el USB. Verás una interfaz similar a la siguiente:

![Selecting boot options install artixlinux](public/selecting_boot_options_install_artix_linux.jpg "Artixlinux")

En la interfaz, selecciona la opción que dice **'From Stick/HDD: *.x86_64'** para iniciar el modo live de ArtixLinux desde el USB. Una vez iniciado, el sistema te pedirá usuario y contraseña; usa **'artix'** para ambos.

---

## Configuraciones Básicas

### Cambiar la distribución del teclado

```bash
sudo loadkeys dvorak
```

**Explicación detallada:**

- **loadkeys:** Carga una nueva distribución de teclado para la consola.
- **dvorak:** Especifica la distribución Dvorak, que puede resultar más cómoda para algunos usuarios.  
El uso de `sudo` es para asegurarse de tener permisos suficientes para cambiar la configuración a nivel de sistema.

Después de esto, se recomienda cambiar a superusuario para facilitar los siguientes pasos:

```bash
su
```

**Explicación:**

- **su:** Cambia de usuario al usuario root (superusuario) sin necesidad de anteponer `sudo` en cada comando. Esto es útil para evitar escribir `sudo` constantemente durante la instalación.

---

## Conectarse a Internet

Primero, verifica las interfaces de red disponibles:

```bash
ip link
```

**Explicación:**

- **ip link:** Muestra la lista de interfaces de red y su estado (up o down). Esto te ayudará a identificar cuál es tu interfaz (por ejemplo, `wlan0` para WiFi).

En este ejemplo se asume que la interfaz WiFi es **wlan0**. Si la interfaz aparece como **DOWN**, significa que no está activa. Antes de activarla, comprueba si el WiFi está bloqueado por software:

```bash
rfkill list all
```

**Explicación:**

- **rfkill list all:** Muestra el estado de los dispositivos de radio (WiFi, Bluetooth, etc.) y si están bloqueados (soft block o hard block).  
Si el WiFi aparece con **soft block**, significa que está bloqueado a nivel de software.

Para desbloquear el WiFi, ejecuta:

```bash
rfkill unblock wifi
```

**Explicación:**

- **rfkill unblock wifi:** Elimina el bloqueo a nivel de software para el dispositivo WiFi, permitiendo que pueda ser activado.

Ahora activa la interfaz WiFi:

```bash
ip link set wlan0 up
```

**Explicación:**

- **ip link set wlan0 up:** Cambia el estado de la interfaz **wlan0** a "up" (activa).

Si usas conexión por cable (Ethernet o USB), bastará con ejecutar el comando `dhcpcd` para obtener una IP. Pero para WiFi se usarán **wpa_supplicant** y **dhcpcd**. Primero, configura el archivo de configuración de **wpa_supplicant**:

```bash
wpa_passphrase "SSID" "Password" > /etc/wpa_supplicant/wpa_supplicant.conf
```

**Explicación:**

- **wpa_passphrase:** Toma el nombre de la red WiFi (**SSID**) y la contraseña (**Password**) y genera un archivo de configuración cifrado para **wpa_supplicant**.
- **> /etc/wpa_supplicant/wpa_supplicant.conf:** Redirige la salida al archivo de configuración, que luego será utilizado por **wpa_supplicant**.

Verifica que el archivo se haya creado correctamente con:

```bash
cat /etc/wpa_supplicant/wpa_supplicant.conf
```

Luego, inicia **wpa_supplicant** en segundo plano:

```bash
wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf
```

**Explicación:**

- **wpa_supplicant:** Es el daemon que gestiona la conexión WiFi.
- **-B:** Ejecuta el proceso en segundo plano.
- **-i wlan0:** Especifica la interfaz (wlan0) que utilizará.
- **-c /etc/wpa_supplicant/wpa_supplicant.conf:** Indica el archivo de configuración previamente creado.

Ahora, asigna una dirección IP a la interfaz con:

```bash
dhcpcd wlan0
```

**Explicación:**

- **dhcpcd:** Es un cliente DHCP que solicita y configura automáticamente una dirección IP para la interfaz especificada (wlan0).

Para verificar que la conexión se ha establecido correctamente, usa:

```bash
ping -c 3 artixlinux.org
```

**Explicación:**

- **ping -c 3 artixlinux.org:** Envía 3 paquetes ICMP (ping) al dominio **artixlinux.org**. Si recibes respuestas, significa que la conexión a Internet está funcionando.

Finalmente, sincroniza el reloj del sistema live:

```bash
dinitctl start ntpd
```

**Explicación:**

- **dinitctl start ntpd:** Usa el comando de control de servicios de dinit para iniciar el daemon de NTP (Network Time Protocol), el cual sincroniza la hora del sistema con servidores de tiempo.

---

## Particionado del Disco (GPT) en Modo UEFI

Esta sección crea tres particiones usando tablas GPT:
1. **ESP (EFI System Partition):** Necesaria para el arranque UEFI (formateada en FAT32, 1GB).
2. **Partición Linux Filesystem:** Contendrá todo el sistema (formato Btrfs).
3. **Partición Swap:** Espacio de intercambio.

Utilizaremos **cfdisk** para particionar el disco. Primero, verifica dónde está montado el disco duro:

```bash
lsblk
```

**Explicación:**

- **lsblk:** Lista los dispositivos de bloques y sus particiones, permitiéndote identificar el nombre correcto del disco (por ejemplo, `mmcblk0`).

Asumiendo que el disco a particionar es **mmcblk0**, lo abrimos con:

```bash
cfdisk /dev/mmcblk0
```

**Explicación:**

- **cfdisk:** Es una herramienta de particionado interactiva en modo texto.
- **/dev/mmcblk0:** Es el dispositivo a particionar.

### Pasos dentro de cfdisk

#### Eliminar particiones existentes

1. Si hay particiones previas, elimínalas (asegúrate de haber respaldado cualquier información importante).
2. Usa las **flechas del teclado** para seleccionar la primera partición.
3. Con la partición seleccionada, elige la opción **"Delete"**.
4. Confirma la eliminación.
5. Repite para todas las particiones hasta que sólo quede espacio libre ("free").

#### Crear la partición UEFI (1 GB)

1. Selecciona **"New"** para crear una nueva partición.
2. Ingresa **1G** para asignar 1 GB.
3. Selecciona la partición recién creada y elige la opción **"Type"** para cambiar su tipo.
4. Selecciona **"EFI System"** en la lista de tipos.

#### Crear la partición Swap (4 GB)

1. Selecciona **"New"** para crear la siguiente partición.
2. Ingresa **4G** o **4096 MB** para asignar 4 GB.
3. Cambia su tipo a **"Linux swap"** mediante la opción **"Type"**.

#### Crear la partición para Btrfs

1. Selecciona **"New"** para crear la última partición.
2. Puedes asignar un tamaño manual o dejar que cfdisk utilice el **resto del espacio disponible**.
3. Por defecto, se configurará como **"Linux Filesystem"**.

#### Escribir la nueva tabla de particiones y salir

1. Revisa que todo esté correcto.
2. Selecciona **"Write"** para grabar la nueva tabla en el disco. Confirma (generalmente escribiendo **"yes"**).
3. Finalmente, selecciona **"Quit"** para salir de cfdisk.

---

## Formateo de las Particiones

Ahora formatearemos cada partición con el sistema de archivos apropiado.

### Partición UEFI

```bash
mkfs.fat -F32 -n "ESP" /dev/mmcblk0p1
```

**Explicación:**

- **mkfs.fat:** Crea un sistema de archivos FAT.
- **-F32:** Especifica que se formatee en FAT32.
- **-n "ESP":** Asigna el nombre o etiqueta "ESP" a la partición.
- **/dev/mmcblk0p1:** Es la partición UEFI que creamos previamente.

### Partición Btrfs

```bash
mkfs.btrfs -L "Artix" /dev/mmcblk0p2
```

**Explicación:**

- **mkfs.btrfs:** Crea un sistema de archivos Btrfs.
- **-L "Artix":** Asigna la etiqueta "Artix" a la partición.
- **/dev/mmcblk0p2:** Es la partición destinada a contener el sistema Linux.

### Partición Swap

```bash
mkswap -L "Swap" /dev/mmcblk0p3
```

**Explicación:**

- **mkswap:** Configura una partición para que funcione como espacio de intercambio (swap).
- **-L "Swap":** Asigna la etiqueta "Swap".
- **/dev/mmcblk0p3:** Es la partición que se usará como swap.

---

## Creación de Subvolúmenes Btrfs y Montaje con Optimización

El sistema Btrfs permite crear subvolúmenes, lo cual facilita la gestión de snapshots y la organización del sistema. En este ejemplo se crean dos subvolúmenes: **@** (para el sistema raíz) y **@home** (para el directorio home).

### Montaje Temporal y Creación de Subvolúmenes

1. Monta la partición Btrfs temporalmente en `/mnt`:

   ```bash
   mount /dev/mmcblk0p2 /mnt
   ```

   **Explicación:**
   - Monta la partición Btrfs en `/mnt` para poder manipularla y crear subvolúmenes.

2. Crea los subvolúmenes:

   ```bash
   btrfs subvolume create /mnt/@
   btrfs subvolume create /mnt/@home
   ```

   **Explicación:**
   - **btrfs subvolume create:** Comando para crear un subvolumen.
   - **/mnt/@ y /mnt/@home:** Se crean dos subvolúmenes, uno para la raíz del sistema y otro para el directorio home.

3. Desmonta la partición:

   ```bash
   umount /mnt
   ```

   **Explicación:**
   - Desmonta la partición temporal para proceder a montar los subvolúmenes con opciones de optimización.

4. Crea el directorio para el subvolumen home:

   ```bash
   mkdir -p /mnt/home
   ```

   **Explicación:**
   - **mkdir -p:** Crea el directorio `/mnt/home` (la opción `-p` crea también directorios padres si es necesario).

5. Monta el subvolumen raíz y el subvolumen home con opciones optimizadas:

   ```bash
   mount -o compress=zstd,noatime,space_cache=v2,subvol=@ /dev/mmcblk0p2 /mnt
   mount -o compress=zstd,noatime,space_cache=v2,subvol=@home /dev/mmcblk0p2 /mnt/home
   ```

   **Explicación:**
   - **mount -o:** Especifica opciones de montaje.
     - **compress=zstd:** Activa la compresión Zstandard para ahorrar espacio.
     - **noatime:** Evita actualizar la fecha de último acceso en cada lectura, lo que mejora el rendimiento.
     - **space_cache=v2:** Utiliza la versión 2 del caché de espacio, optimizando el rendimiento de Btrfs.
     - **subvol=@ o subvol=@home:** Indica qué subvolumen montar.
   - **/dev/mmcblk0p2:** Es la partición Btrfs.
   - **/mnt y /mnt/home:** Son los puntos de montaje para la raíz y el directorio home, respectivamente.

6. Monta la partición UEFI:

   ```bash
   mkdir -p /mnt/boot/efi
   mount /dev/mmcblk0p1 /mnt/boot/efi
   ```

   **Explicación:**
   - Se crea el directorio `/mnt/boot/efi` para montar la partición EFI y se monta la partición UEFI en él.

---

## Instalación del Sistema Base con basestrap

```bash
basestrap /mnt base base-devel dinit elogind-dinit linux linux-firmware btrfs-progs sof-firmware alsa-firmware
```

**Explicación detallada:**

- **basestrap:** Es una herramienta propia de Artix (similar a pacstrap en Arch) que instala paquetes en el sistema montado en `/mnt`.
- **/mnt:** Es el directorio de montaje donde se instalará el sistema.
- Los paquetes instalados son:
  - **base:** Paquetes esenciales del sistema.
  - **base-devel:** Herramientas de desarrollo necesarias para compilar software (make, gcc, etc.).
  - **dinit:** El sistema de inicio (init) alternativo a systemd.
  - **elogind-dinit:** Versión de elogind adaptada para dinit, que gestiona sesiones y logueos.
  - **linux:** El kernel de Linux.
  - **linux-firmware:** Firmware para el hardware, necesario para muchos dispositivos.
  - **btrfs-progs:** Herramientas para gestionar sistemas de archivos Btrfs.
  - **sof-firmware y alsa-firmware:** Firmware para dispositivos de audio (SOF para procesadores de sonido modernos y ALSA para compatibilidad).

---

## Generar fstab

```bash
fstabgen -U /mnt >> /mnt/etc/fstab
```

**Explicación:**

- **fstabgen:** Herramienta de Artix para generar el archivo **/etc/fstab** automáticamente.
- **-U:** Indica que se usen UUIDs (identificadores únicos) en vez de rutas de dispositivo, lo que aumenta la robustez de la configuración.
- **>> /mnt/etc/fstab:** Redirige (añade) la salida al archivo **fstab** en el sistema instalado.

---

## Ingresar al Sistema Instalado (chroot)

```bash
artix-chroot /mnt
```

**Explicación:**

- **artix-chroot:** Herramienta para cambiar la raíz (chroot) al sistema instalado en `/mnt`. Esto permite configurar el sistema como si se estuviera ejecutando normalmente (cambiar zona horaria, locales, usuarios, etc.).

---

## Configuración Básica del Sistema

### Zona Horaria (Timezone)

```bash
ln -s /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime
```

**Explicación:**

- **ln -s:** Crea un enlace simbólico.
- **/usr/share/zoneinfo/America/Argentina/Buenos_Aires:** Es el archivo de zona horaria correspondiente a Buenos Aires.
- **/etc/localtime:** Es el archivo que el sistema consulta para saber la zona horaria actual.
- Esto asegura que el sistema muestre la hora correcta para la región especificada.

Luego, sincroniza la hora del reloj de hardware:

```bash
hwclock --systohc
```

**Explicación:**

- **hwclock:** Permite interactuar con el reloj de hardware.
- **--systohc:** Ajusta el reloj de hardware a la hora actual del sistema, lo que es importante para mantener la hora correcta en arranques futuros.

---

### Localización (Locales)

Edita el archivo de locales para habilitar los que necesites:

```bash
vi /etc/locale.gen
```

**Explicación:**

- **vi /etc/locale.gen:** Abre el archivo de configuración de locales en el editor **vi**.  
  Dentro del archivo, descomenta (quita el `#`) las líneas de los locales que deseas usar (por ejemplo, **en_US.UTF-8 UTF-8**).

Luego, genera los locales ejecutando:

```bash
locale-gen
```

**Explicación:**

- **locale-gen:** Lee el archivo **/etc/locale.gen** y genera los archivos necesarios para los locales habilitados.

---

### Configurar la Distribución de Teclado en Consola

Edita el archivo de configuración del teclado para las TTY:

```bash
vi /etc/vconsole.conf
```

Y agrega, por ejemplo, para teclado Dvorak:

```
KEYMAP=dvorak
```

**Explicación:**

- Este archivo asegura que, en las consolas virtuales (TTY), se cargue la distribución de teclado correcta (dvorak en este caso).

---

### Nombre de Máquina (Hostname) y Hosts

Asigna un nombre a tu equipo:

```bash
echo "archlua" > /etc/hostname
```

**Explicación:**

- **echo "archlua" > /etc/hostname:** Escribe el nombre **archlua** en el archivo **/etc/hostname**, que es utilizado por el sistema para identificar el equipo en la red.

Configura el archivo **/etc/hosts** para asociar el hostname a direcciones locales:

Abre el archivo con **vi** y asegúrate de que contenga:

```
127.0.0.1    localhost
::1          localhost
127.0.1.1    archlua.dev   archlua
```

**Explicación:**

- **127.0.0.1 y ::1:** Se refieren a la dirección loopback en IPv4 e IPv6, respectivamente.
- **127.0.1.1 archlua.dev archlua:** Mapea el hostname a otra dirección de loopback, facilitando la resolución de nombres localmente.

---

### Contraseña de Root y Creación de Usuario

#### Establecer la Contraseña de Root

```bash
passwd
```

**Explicación:**

- **passwd:** Permite establecer o cambiar la contraseña del usuario actual (en este caso, root). La contraseña no se muestra mientras se teclea, lo que protege su confidencialidad.

#### Crear un Usuario Regular

```bash
useradd -m -G wheel -s /bin/bash luanon
passwd luanon
```

**Explicación:**

- **useradd -m -G wheel -s /bin/bash luanon:**
  - **-m:** Crea el directorio home para el usuario.
  - **-G wheel:** Añade al usuario al grupo **wheel**, que se usará para conceder permisos de sudo.
  - **-s /bin/bash:** Define **/bin/bash** como el shell por defecto para el usuario.
- **passwd luanon:** Establece la contraseña para el usuario **luanon**.

---

### Configurar Sudo

Instala sudo (si aún no lo está):

```bash
pacman -S sudo
```

**Explicación:**

- **pacman -S sudo:** Usa **pacman** (el gestor de paquetes de Artix/Arch) para instalar **sudo**, lo que permite ejecutar comandos con privilegios elevados sin tener que cambiar completamente a root.

Luego, configura sudo de manera segura editando el archivo sudoers:

```bash
EDITOR=vi visudo
```

**Explicación:**

- **EDITOR=vi visudo:** Abre el archivo **sudoers** en el editor **vi** de forma segura (visudo valida la sintaxis antes de guardar), asegurando que la línea:
  ```
  %wheel ALL=(ALL) ALL
  ```
  se encuentre descomentada. Esto permite que cualquier usuario del grupo **wheel** pueda usar `sudo`.

---

## Configurar la Red WiFi en el Sistema Final

Para tener conexión WiFi en el sistema final se instalarán y configurarán **dhcpcd** y **wpa_supplicant**.

#### Instalar los Paquetes Necesarios

```bash
pacman -S dhcpcd wpa_supplicant
```

**Explicación:**

- **dhcpcd:** Cliente DHCP que se encarga de asignar direcciones IP de manera automática.
- **wpa_supplicant:** Herramienta para gestionar la conexión WiFi, necesaria para conectarse a redes protegidas con WPA/WPA2.

#### Configuración de los Servicios en Dinit

Como Artix utiliza **dinit** en lugar de systemd, se deben crear archivos de configuración para habilitar los servicios al arranque.

1. **wpa_supplicant:**  
   Crea un archivo en `/etc/dinit.d/` (por ejemplo, llamado `wpa_supplicant`) con el siguiente contenido:
   ```
   type            = process
   command         = /usr/bin/wpa_supplicant -i ${WPA_INTERFACE:-wlan0} -c /etc/wpa_supplicant/wpa_supplicant.conf 2>&1
   env-file        = /etc/dinit.d/config/wpa_supplicant.conf
   smooth-recovery = true
   logfile         = /var/log/dinit/wpa_supplicant.log
   depends-on      = pre-network.target
   before          = network.target
   ```

   **Explicación:**
   - **command:** Llama a **wpa_supplicant** con la interfaz indicada y la configuración correspondiente.
   - **env-file:** Permite definir variables de entorno (como `WPA_INTERFACE`).
   - **smooth-recovery:** Habilita una recuperación suave en caso de fallo.
   - **logfile:** Define dónde guardar el log del servicio.
   - **depends-on** y **before:** Aseguran que el servicio se inicie en el orden correcto respecto a la red.

2. Crea el archivo de entorno para **wpa_supplicant** en `/etc/dinit.d/config/wpa_supplicant.conf`:

   ```
   # Set wireless interface, by default it would be wlan0, but you can set
   # it to wlp3s0 or any other wireless interface you want.
   
   WPA_INTERFACE="wlan0"
   ```

3. Crea el archivo para **dhcpcd** en `/etc/dinit.d/` (por ejemplo, llamado `dhcpcd`) con el siguiente contenido:

   ```
   type            = process
   command         = /usr/bin/dhcpcd -B -M
   smooth-recovery = true
   logfile         = /var/log/dinit/dhcpcd.log
   depends-on      = pre-network.target
   before          = network.target
   ```

   **Explicación:**
   - **-B:** Ejecuta dhcpcd en background.
   - **-M:** Permite que el cliente gestione múltiples interfaces.
  
4. Activa ambos servicios con:

   ```bash
   dinitctl enable wpa_supplicant
   dinitctl enable dhcpcd
   ```

   **Explicación:**

   - **dinitctl enable:** Habilita el servicio especificado para que se inicie en cada arranque. De esta forma, **wpa_supplicant** gestionará la conexión WiFi y **dhcpcd** asignará las direcciones IP automáticamente.

---

## Instalación de GRUB (Gestor de Arranque) en Modo UEFI

Para que el sistema pueda arrancar, se debe instalar GRUB en la partición ESP.

1. Verifica que `/boot/efi` esté montado (lo hicimos en pasos anteriores). Si el directorio está vacío o contiene solo archivos del fabricante, está listo para usarse.

2. Instala GRUB y utilidades relacionadas:

   ```bash
   pacman -S grub efibootmgr
   ```

   **Explicación:**

   - **grub:** Es el gestor de arranque que nos permitirá elegir qué sistema iniciar.
   - **efibootmgr:** Herramienta para gestionar entradas de arranque UEFI.

3. Instala GRUB en la ESP:

   ```bash
   grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=grub
   ```

   **Explicación:**

   - **--target=x86_64-efi:** Especifica que se está instalando GRUB para sistemas UEFI de 64 bits.
   - **--efi-directory=/boot/efi:** Define la ruta donde se encuentra la partición EFI.
   - **--bootloader-id=grub:** Es el identificador (nombre) que se mostrará en el menú de arranque UEFI.

4. Genera la configuración de GRUB:

   ```bash
   grub-mkconfig -o /boot/grub/grub.cfg
   ```

   **Explicación:**

   - **grub-mkconfig:** Escanea el sistema para generar un archivo de configuración para GRUB.
   - **-o /boot/grub/grub.cfg:** Especifica la ruta donde se escribirá la configuración.

---

## Instalación de Paquetes Adicionales

Antes de reiniciar, se instalan algunas herramientas adicionales:

```bash
pacman -S git neovim
```

**Explicación:**

- **git:** Sistema de control de versiones muy usado para gestionar código.
- **neovim:** Una versión mejorada y modernizada del editor de texto Vim.

---

## Finalizar y Reiniciar

Una vez completada la instalación y configuración básica, es momento de finalizar y reiniciar el sistema.

1. Salir del entorno **chroot**:

   ```bash
   exit
   ```
   
   **Explicación:**  
   - **exit:** Sale del entorno chroot, volviendo al sistema live.

2. Desmontar todas las particiones montadas en **/mnt** de manera recursiva:

   ```bash
   umount -R /mnt
   ```

   **Explicación:**
   - **umount -R /mnt:** Desmonta todos los puntos de montaje que estén bajo `/mnt` (incluye `/mnt/home`, `/mnt/boot/efi`, etc.), asegurando que se cierren en el orden correcto.

3. Reinicia el sistema:

   ```bash
   reboot
   ```

   **Explicación:**
   - **reboot:** Reinicia el sistema. Recuerda retirar el medio de instalación (USB) para que el equipo arranque desde el disco.

Si todo ha ido bien, tu firmware UEFI reconocerá la entrada **"grub"** instalada, y GRUB cargará el kernel de ArtixLinux. Después de unos momentos, se presentará la pantalla de login (en modo texto, ya que no se instaló entorno gráfico). Podrás iniciar sesión con el usuario creado (por ejemplo, **luanon**) o con **root**, utilizando las contraseñas que configuraste.
