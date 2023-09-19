import express from "express"
import { MongoClient,ObjectId } from "mongodb"
import dotenv from "dotenv";

dotenv.config()

const router = express.Router()

const conexiondb = process.env.MONGO_ELN
const nombredb = 'Campuslands_EPS'

router.get("/getAll", async (req,res)=>{
    try {
        const client = new MongoClient(conexiondb)
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Usuarios")
        const result = await collection.find().toArray()

        res.json(result)
        client.close()

    } catch (error) {
        console.log(error);
    }
})


//! Obtener todos los pacientes de manera alfabética.

router.get("/endpoint1", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)
    try {
        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Usuarios")
        const result = await collection.aggregate([
            {
              $sort: { usu_nombre: 1 } // Ordena en orden ascendente por el campo "nombre"
            }
          ]).toArray()

        res.json(result)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
 
    }finally{
        client.close()
        console.log("Servidor cerrado")
    }
})


//! Obtener las citas de una fecha en específico , donde se ordene los pacientes de manera alfabética.

router.get("/endpoint2", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)
    try {
        const fecha = "2023-08-23"

        const fechaConsulta = new Date(fecha);

        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Cita")
        const result = await collection.aggregate([
            {
                $match:{cit_fecha: fechaConsulta}
            },
            {
                $lookup: {
                    from: "Usuarios",
                    localField: "cit_datosUsuario",
                    foreignField: "usu_id",
                    as: "cit_datosUsuario"

                }
            },
            {
                $unwind: "$cit_datosUsuario"
            },
            {
                $sort:{
                    "cit_datosUsuario.usu_nombre":1
                }
            }
        ]).toArray()

        res.json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
 
    }finally{
        client.close()
        console.log("Servidor cerrado")
    }
})


//! Obtener todos los médicos de una especialidad en específico (por ejemplo, ‘Cardiología’).

router.get("/endpoint3", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)
    try {        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Medico")
        const result = await collection.aggregate([
            {
                $lookup:{
                    from: "Especialidades",
                    localField:"med_especialidad",
                    foreignField:"esp_id",
                    as:"med_especialidad"

                }
            },
            {
                $unwind: "$med_especialidad"
            },
            {
                $match: {
                    "med_especialidad.esp_nombre":"Cardiología"
                }

            },
            {
                $project: {
                  _id: 0,
                  med_nroMatriculo: 1,
                  med_nombre_Completo: 1,
                  med_consultorio: 1,
                  "med_especialidad.esp_nombre": 1,
                }
            }
        ]).toArray()

        res.json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
 
    }finally{
        client.close()
        console.log("Servidor cerrado")
    }
})


// !Encontrar la próxima cita para un paciente en específico (por ejemplo, el paciente con user_id 1).

router.get("/endpoint4", async (req,res)=>{
    const client = new MongoClient(conexiondb)

    try {



        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Cita")
        const result = await collection.aggregate([
            {
                $match:{
                    cit_datosUsuario:1
                }
            },
            {
                $sort:{
                    cit_fecha:1,
                }
            },
            {
                $limit:1
            },
            {
                $lookup:{
                    from: "Usuarios",
                    localField: "cit_datosUsuario",
                    foreignField: "usu_id",
                    as: "cit_datosUsuario"
                }

            },
            {
                $unwind: "$cit_datosUsuario"
            }
        ]).toArray()

        res.json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
 
    }finally{

        client.close()
        console.log("Servidor cerrado")
    }
})


//! Obtener todos los médicos de una especialidad en específico (por ejemplo, ‘Cardiología’).


router.get("/endpoint5", async (req, res)=>{

    const client = new MongoClient(conexiondb)
    try {

        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Cita")
        const result = await collection.aggregate([
            {
                $match:{
                    cit_medico:1
                }
            },
            {
                $sort:{
                    cit_fecha:1
                }
            },
            {
                $lookup:{
                    from: "Usuarios",
                    localField: "cit_datosUsuario",
                    foreignField: "usu_id",
                    as: "cit_datosUsuario"
                }
            },
            {

                $unwind: "$cit_datosUsuario"
            },
            {
                
                $lookup:{
                    from: "Medico",
                    localField: "cit_medico",
                    foreignField: "med_nroMatriculo",
                    as: "cit_medico"
                }
            },
    
            {
                $unwind: "$cit_medico"
            },
            {
                $project:{
                    _id:0,
                    cit_codigo: 1,
                    cit_fecha: 1,
                    cit_estadoCita: 1,
                   
                   
                    "cit_datosUsuario.usu_id": 1,
                    "cit_datosUsuario.usu_nombre": 1,
                    "cit_datosUsuario.usu_segundo_nombre": 1,
                    "cit_datosUsuario.usu_primer_apellido_usuar": 1,
                    "cit_datosUsuario.usu_segdo_apellido_usuar": 1,

                    "cit_medico.med_nroMatriculo": 1,
                    "cit_medico.med_nombre_Completo": 1,
                    "cit_medico.med_consultorio": 1,
                    "cit_medico.med_especialidad": 1
                
                 
                }
            }
        ]).toArray()

        res.json(result)

        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
 
    }finally{

        client.close()
        console.log("Servidor cerrado")
    }
})


//! Obtener todos los médicos de una especialidad en específico (por ejemplo, ‘Cardiología’).

router.get("/endpoint6", async (req,res)=>{ 

    const client = new MongoClient(conexiondb)

    try {
        const fecha = "2023-08-23"
        const fechaConsulta = new Date(fecha); 

        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Cita")
        const result = await collection.aggregate([
            
            {
                $match:{ 
                    cit_fecha: fechaConsulta

                }
            }
          
        ]).toArray()

        res.json(result)
        

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }finally{

        client.close()
        console.log("Servidor cerrado")
    }
})

//! Obtener todos los médicos con sus consultorios correspondientes.

router.get("/endpoint7", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)
    try {
        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Medico")
        const result = await collection.aggregate([
            {
                $lookup:{
                    from: "Consultorio",
                    localField:"med_consultorio",
                    foreignField:"cons_codigo",
                    as: "med_consultorio"
                }
            },
            {
                $unwind: "$med_consultorio"
                
            },
            {
                $project:{
                    _id:0,
                    med_nroMatriculo: 1,
                    med_nombre_Completo: 1,
       
                    med_especialidad: 1,

                    "med_consultorio.cons_nombre":1,
                    "med_consultorio.cons_codigo":1 
                }
            }
        ]).toArray()

        res.json(result)
   

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }finally{

        client.close()
        console.log("Servidor cerrado")
    }
})


//! Contar el número de citas que un médico tiene en un día específico (por ejemplo, el médico con med_numMatriculaProfesional 1 en ‘2023-07-12’).

router.get("/endpoint7", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)
    try {
        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Medico")
        const result = await collection.aggregate([]).toArray()

        res.json(result)
   

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }finally{

        client.close()
        console.log("Servidor cerrado")
    }
})


//! Obtener lo/s consultorio/s donde se aplicó las citas de un paciente.

router.get("/endpoint9", async (req, res) => {
    const client = new MongoClient(conexiondb);

    try {
        await client.connect();
        const db = client.db(nombredb);
        const collection = db.collection("Cita");
        const result = await collection.aggregate([
            {
                $lookup: {
                    from: "Medico",
                    localField: "cit_medico",
                    foreignField: "med_nroMatriculo",
                    as: "cit_medico",
                },
            },
            {
                $unwind: "$cit_medico"
            },
            {
                $lookup: {
                    from: "Usuarios",
                    localField: "cit_datosUsuario",
                    foreignField: "usu_id",
                    as: "cit_datosUsuario"
                },
            },
            {
                $unwind: "$cit_datosUsuario"
            },
            {
                $lookup: {
                    from: "Consultorio",
                    localField: "cit_medico.med_consultorio",
                    foreignField: "cons_codigo",
                    as: "med_consultorio"
                },
            },
            {
                $unwind: "$med_consultorio"
            },
            {
                $project: {
                    _id: 0,
                    cit_codigo: 1,
                    cit_fecha: 1,
                    cit_estadoCita: 1,
                    "cit_datosUsuario.usu_id": 1,
                    "cit_datosUsuario.usu_nombre": 1,
                    "cit_datosUsuario.usu_segundo_nombre": 1,
                    "cit_datosUsuario.usu_primer_apellido_usuar": 1,
                    "cit_datosUsuario.usu_segdo_apellido_usuar": 1,
                    "cit_medico.med_nroMatriculo": 1,
                    "cit_medico.med_nombre_Completo": 1,
                    "cit_medico.med_especialidad": 1,
                    "cit_medico.med_consultorio": {
                        "cons_codigo": "$med_consultorio.cons_codigo",
                        "cons_nombre": "$med_consultorio.cons_nombre"
                    }
                }
            }
        ]).toArray();

        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        client.close();
        console.log('Servidor Cerrado');
    }
})


export default router;