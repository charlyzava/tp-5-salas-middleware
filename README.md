# Trabajo práctico 05
Carlos Zavaleta

## Descripción

La aplicación consiste en un sitio web para consultar salas de estudio y realizar reservas temporales.
El proyecto utiliza Node.js, Express y EJS, incorporando el concepto de pipeline de middleware para organizar el procesamiento de las solicitudes HTTP.


## Instalación

Luego de descargar el archivo se procede a ejecutar en una terminal

npm install

y se instalarán los siguientes paquetes:

express
ejs
express-ejs-layouts
morgan


## Ejecución

npm run check

se ejecuta para verificar la sintaxis del archivo principal

npm start

para iniciar el servidor

El sistema se puede ver a través del navegador con la siguiente dirección:

http://localhost:3000

## Rutas

La aplicación cuenta con las siguientes rutas:

Método	    Ruta	            Descripción	                            Respuesta
GET	        /	                Página de inicio	                    HTML
GET	        /estado	            Estado actual del servicio	            JSON
GET	        /reservas	        Listado de reservas	                    HTML
GET	        /reservas/nueva     Formulario para crear una reserva	    HTML
GET	        /reservas/:id	    Detalle de una reserva	                HTML
POST	    /reservas	        Validación y creación de una reserva	Redirección 302


## Pipeline de middleware


El pipeline global de la aplicación sigue el siguiente orden:

Morgan
   ↓
identificarSolicitud
   ↓
medirDuracion
   ↓
expressLayouts
   ↓
express.static
   ↓
express.urlencoded
   ↓
express.json
   ↓
rutas de aplicación
   ↓
router de reservas
   ↓
página 404
El orden es importante porque cada middleware puede preparar información que será utilizada posteriormente.
Para una reserva válida, el recorrido completo es:
POST /reservas
   ↓
morgan("dev")
   ↓
identificarSolicitud
   ↓
medirDuracion
   ↓
expressLayouts
   ↓
express.urlencoded
   ↓
reservasRouter
   ↓
prepararAreaReservas
   ↓
validarReserva
   ↓
crearReserva
   ↓
302 /reservas
   ↓
finish: ID + estado + duración
La consigna exige este diagrama para documentar el recorrido de un POST válido.
POST inválido
Cuando los datos enviados no cumplen las condiciones de validación:
POST /reservas
   ↓
morgan("dev")
   ↓
identificarSolicitud
   ↓
medirDuracion
   ↓
express.urlencoded
   ↓
reservasRouter
   ↓
prepararAreaReservas
   ↓
validarReserva
   ↓
400
   ↓
render formulario
   ↓
fin del ciclo
En este caso crearReserva no se ejecuta, porque validarReserva finaliza la respuesta con estado 400.


## Alcance de cada función

Morgan
Es un middleware de terceros utilizado para registrar las solicitudes HTTP.
Se configura mediante:
app.use(morgan("dev"));
Muestra información como:
•	Método HTTP.
•	Ruta.
•	Estado de respuesta.
•	Tiempo de respuesta.
•	Tamaño aproximado.
Por ejemplo:
GET /reservas 200 8.124 ms - 2310


## Validación



## Pruebas manuales

Inicio	            200	    Navegación e ID de solicitud
Estado	            200	    JSON con cantidad e ID
Listado         	200	    Cuatro o más reservas
Estado vacío	    200	    Mensaje alternativo
Formulario	        200	    Controles correctamente etiquetados
Detalle válido	    200	    Datos completos
Detalle inexistente	404	    Página HTML de error
Campos vacíos	    400	    Error y valores conservados
Sala no permitida	400	    No se crea reserva
Turno no permitido	400	    No se crea reserva
Email sin @	        400	    No se crea reserva
Personas igual a 0	400	    No se crea reserva
Personas igual a 7	400	    No se crea reserva
Reserva válida	    302     → 200	Nueva reserva visible
URL inexistente	    404	    Middleware 404
Reinicio	        200	    Regreso a datos iniciales


## Persistencia temporal
Las reservas se almacenan únicamente en memoria mediante un arreglo definido en src/index.js.
Por ejemplo:
const reservas = [
    // reservas iniciales
];
Cuando se realiza una nueva reserva válida, el registro se agrega al arreglo:
reservas.push(nuevaReserva);
No se utiliza:
•	Base de datos.
•	Archivo JSON para guardar nuevas reservas.
•	Sesiones.
•	Cookies.
•	Otro mecanismo de persistencia permanente.
Por esta razón, las nuevas reservas solamente existen mientras el servidor permanece funcionando.
Si se detiene y vuelve a iniciar la aplicación:
npm start
el arreglo vuelve a cargarse con las reservas iniciales definidas en el código.



# ########################################################################

# Explicar con palabras propias:
# diferencia entre middleware incorporado, de terceros y personalizado;

Middleware incorporado son los vienen incluidos con Express, ej:

express.urlencoded();

Middleware de Terceros: 
Son los que instalamos mediante npm, que fueron desarrollados por personas o comunidades como, ej: 
morgan

Middleware personalizados:
Son middlewares que el programador realiza para resolver una tarea específica. ej:
validación de datos.



# cuándo se utiliza next() ;
Next se utiliza en un middleware de Express para indicar que terminó su trabajo y que la solicitud debe continuar con el siguiente middleware o controlador.


# por qué los parsers aparecen antes de la validación;
Porque el objetivo de los parsers es que express pueda interpretar los datos, sino no podría validarlos.

# diferencia entre alcance global, de router y de ruta;

Alcance Global: El middleware se aplica a todas las solicitudes que pasan por la aplicación, salvo que se limite mediante alguna condición.

app.use(express.json());

app.use(middleware);

app.get("/reservas", ...);
app.get("/usuarios", ...);

middleware se ejecutará en las 2 rutas.

Alcance de Router: El middleware se aplica solamente a las rutas que pertenecen a un Router específico.

const router = express.Router();

router.use(validarReserva);

router.get("/", ...);
router.post("/", ...);

app.use("/reservas", router);

El router tiene alcance para /reservas y /reservas/...

Alcance de Ruta: es cuando se coloca en una ruta específica, por ejemplo:

app.post("/reservas", validarReserva, crearReserva);

validarReserva se ejecutará en POST /reservas


# motivo del evento finish ;

El evento finish se utiliza en Express para saber cuándo terminó de enviarse la respuesta al cliente.

Es útil para medir cuánto tardó una solicitud completa.


# resultado del montaje del router;

El montaje de un Router consiste en conectar un router a una ruta base de la aplicación mediante app.use() y el resultado es que Todas las rutas definidas dentro de reservasRouter quedan debajo de /reservas.

Entonces si dentro del router tenemos una ruta como router.get("/:id", ...)

El resultado es: /reservas/:id

es útil para organizar las rutas por módulos


# diferencia entre el POST 302 y el GET posterior;

Después de procesar correctamente el POST, el servidor puede hacer un res.redirect("/reservas") lo que genera un 302 Found, el navegador recibe el 302 y realiza una nueva solicitud, ésta solicitud se utiliza para mostrar la página actualizada.

# motivo por el cual las altas desaparecen al reiniciar.

Las altas no se guardan ni en un archivo, o en una base de datos. Sólo quedan en memoria, por eso al reiniciar desaparecen.