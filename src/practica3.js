const express = require("express");
const path = require("node:path");

const { leerJson } = require("./archivos");

const PORT = 3000;
const rutaDatos = fs.readFile(__dirname, "..", "datos","productos.json");

async function main(){
    const productos = await leerJson(rutaDatos);
    const app = express();

    app.get("api/productos",(req,res)=>{
        res.json(productos);
    })

    app.listen(PORT, ()=>{
        console.log(`La aplicación está funcionando en http://localhost:`,PORT);
    })
}

main().catch((error) =>{
    console.error("No se pudo iniciar la aplicacion",error);
    process.exitCode = 1;
})