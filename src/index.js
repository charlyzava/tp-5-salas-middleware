const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const PORT = 3000;

/*
const inscripciones = [
    {
        "id": 1,
        "participante": "Carlos Pérez",
        "recorrido": "Mirador del Bosque",
        "fecha": "2026-09-22",
        "lugares": 1
    },
    {
        "id": 2,
        "participante": "María González",
        "recorrido": "Sendero del Arroyo",
        "fecha": "2026-09-22",
        "lugares": 1
    }
]*/

const reservas = [
    {
        "id": 1,
        "estudiante": "Ricardo Lopez",
        "email": "ricardo5534@hotmail.com",
        "sala": "Sala Norte",
        "fecha": "2026-09-25",
        "turno": "Mañana",
        "personas": 5
    },
    {
        "id": 2,
        "estudiante": "Agustina Gutierrez",
        "email": "agu_lamejor@gmail.com",
        "sala": "Sala Multimedia",
        "fecha": "2026-09-26",
        "turno": "Noche",
        "personas": 3
    }

]

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
    //const recorridosPermitidos = ["Sendero del arroyo", "Mirador del bosque"];

//middleware
let numeroDeSolicitud = 0;
function identificarSolicitud(req, res, next) {
    numeroDeSolicitud += 1;
    //res.locals.solicitudId = `SOL-${String(numeroDeSolicitud).padStart(4, "0")}`;
    res.locals.solicitud = `CAM-${String(numeroDeSolicitud)}`;
    console.log(`identificarSolicitud : [res.locals.solicitudId] ${req.method} $req.originalurl`);
    next();
}

//middleware
function medirDuracion(req, res, next) {
    const inicio = process.hrtime.bigint();
    res.on("finish", () => {

        const duracion = Number(process.hrtime.bigint() - inicio) / 1_000_000;

        console.log(
            `duracion: [${res.locals.soicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duracion.toFixed(2)} ms`,
        );
    });
    next();
}

//middleware
/*function prepararAreaCaminatas(req, res, next) {
    res.locals.seccion = "Inscripciones a Caminatas";
    console.log("seccion: " + res.locals.seccion);
    next();
}*/
function reservaSalasEstudio(req,res,next){
    res.locals.seccion = "Reserva de Sala de Estudio";
    console.log("seccion: " + res.locals.seccion);
    next();
}

//middleware
function validarinscripcion(req, res, next) {
    const participante = req.body.participante?.trim();
    const recorrido = req.body.recorrido?.trim();
    const fecha = req.body.fecha?.trim();
    const lugares = Number(req.body.lugares);


    const datosValidos =
        participante &&
        recorridosPermitidos.includes(recorrido) &&
        fecha &&
        Number.isInteger(lugares) &&
        lugares >= 1 &&
        lugares <= 5;

    if (!datosValidos) {
        return res.status(400).render("inscripcion/nueva", {
            titulo: "nueva inscripcion",
            error: "revisa los cambios y elegi entre 1 y 5 lugares.",
            valores: req.body,
        });
    }

    req.inscripcionValidada = { participante, recorrido, fecha, lugares };
    next();

}

//middleware
function crearInscripcion(req, res) {
    const ultimoId =
        inscripciones.length === 0 ? 0 : inscripciones[inscripciones.length - 1].id;
    inscripciones.push({
        id: ultimoId + 1,
        ...req.inscripcionValidada,/* puede ser validado*/
    });
    res.redirect("/inscripciones");
}

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.set("layout", "layouts/main");
app.use(morgan("dev"));
app.use(identificarSolicitud);
app.use(medirDuracion);
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
/**/


app.get("/", (req, res) => {
    res.status(200).render("inicio", { titulo: "Caminatas del Valle" });
});
app.get("/estado", (req, res) => {
    res.status(200).json({
        servicio: "activo",
        inscripciones: inscripciones.length,
        solicitud: res.locals.solicitudId
    })
})





const caminatasRouter = express.Router();

caminatasRouter.use(prepararAreaCaminatas);

caminatasRouter.get("/", (req, res) => {
    res.status(200).render("inscripciones/lista", {
        titulo: "Inscripciones",
        inscripciones,
    })
})


caminatasRouter.post("/", validarinscripcion, crearInscripcion);

app.use("/inscripciones", caminatasRouter);



caminatasRouter.get("/nueva", (req, res) => {
    res.status(200).render("inscripciones/nueva", {
        titulo: "nueva Inscripcion",
        error: null,
        valores: {},
        recorridosPermitidos
    })
})

app.get("/inscripciones/:id", (req, res) => {
 const id = Number(req.params.id);
 const inscripcion = inscripciones.find((elemento) => elemento.id === id);
 if (!inscripcion) {
 return res.status(404).render("no-encontrado", {
 titulo: "Mascota no encontrada",
 mensaje: "No existe una mascota con ese identificador.",
 });
 }

 res.render("inscripciones/detalle", {
 titulo: inscripcion.participante,
 inscripcion,
 });
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})


