import express from "express"
import { MongoClient } from "mongodb"
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


//? Obtener las citas de una fecha en específico , donde se ordene los pacientes de manera alfabética.

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


//? Obtener todos los médicos de una especialidad en específico (por ejemplo, ‘Cardiología’).

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


//? Encontrar la próxima cita para un paciente en específico (por ejemplo, el paciente con user_id 1).

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


//? Encontrar todos los pacientes que tienen citas con un médico en específico (por ejemplo, el médico con med_numMatriculaProfesional 1).

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


//? Encontrar todas las citas de un día en específico (por ejemplo, ‘2023-07-12’)

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

//? Obtener todos los médicos con sus consultorios correspondientes.

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


//? Contar el número de citas que un médico tiene en un día específico (por ejemplo, el médico con med_numMatriculaProfesional 1 en ‘2023-07-12’).

router.get("/endpoint8", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)

  
    try {
        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Usuarios")
        const result = await collection.aggregate([
            {

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


//? Obtener lo/s consultorio/s donde se aplicó las citas de un paciente.

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


//? Obtener todas las citas realizadas por los pacientes de acuerdo al género registrado, siempre y cuando el estado de la cita se encuentra registrada como “Atendida”.

router.get("/endpoint10/:genero", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)

    const genero = req.params.genero
    try {
        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Usuarios")
        const result = await collection.aggregate([
            {
                $lookup: {
                    from: "Genero",
                    localField: "usu_genero",
                    foreignField: "gen_id",
                    as : "usu_genero"
                }
            },
            {
                $unwind: "$usu_genero"
            },
            {
                $match:{ "usu_genero.gen_nombre" : genero}
            },
            {
                $lookup:{
                    from: "Cita",
                    localField: "usu_id",
                    foreignField: "cit_datosUsuario",
                    as : "citas_registradas"
                }
            },
            {
                $unwind: "$citas_registradas"
            },
            {
                $lookup:{
                    from: "Estado_Cita",
                    localField: "citas_registradas.cit_estadoCita",
                    foreignField: "estcita_id",
                    as: "cit_estado"
                }
            },
            {
                $unwind: "$cit_estado"
            },
            {
                $match:{"cit_estado.estcita_nombre":"Atendida"}
            },
            {
                $project:{
                    
                        
                        _id: 0,
                        usu_nombre: 1,
                        usu_segundo_nombre: 1,
                        usu_primer_apellido_usuar: 1,
                        usu_segdo_apellido_usuar: 1,
                        usu_telefono: 1,
                        usu_direccion: 1,
                        usu_tipodoc: 1,
                        usu_acudente: 9,
                        usu_id: 9,

                        "usu_genero.gen_id":1,
                        "usu_genero.gen_nombre":1,
                        "usu_genero.gen_abreviatura":1,


                        "citas_registradas.cit_codigo":1,
                        "citas_registradas.cit_fecha":1,
                        "citas_registradas.cit_estadoCita":{
                            "estcita_nombre": "$cit_estado.estcita_nombre",
                            "estcita_id": "$cit_estado.estcita_id"

                        },
                        "citas_registradas.cit_medico":1,
                        "citas_registradas.cit_datosUsuario":1,
                 
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


//? Insertar un paciente a la tabla usuario, donde si es menor de edad deberá solicitar primero que ingrese el acudiente y validar si ya estaba registrado el acudiente (El usuario deberá poder ingresar de manera personalizada los datos del usuario a ingresar).


router.get("/endpoint11/:edades/", async (req, res) => {
    const client = new MongoClient(conexiondb);

    

    try {
        await client.connect();
        const db = client.db(nombredb);
 
        const { usu_id, usu_nombre, usu_segundo_nombre, usu_primer_apellido_usuar,usu_segdo_apellido_usuar,usu_telefono, usu_direccion,usu_tipodoc,usu_genero, usu_acudente } = req.body;

        const edad = req.params.edades

 
        if (edad < 18) {
            

            if (!usu_acudente) {
                return res.status(400).json({ message: 'Se requiere un acudiente para pacientes menores de edad' });
            }
 
            // * Flata validar si existe o no el acudente ingresado
      

            const acudiente = await db.collection("Usuarios").aggregate( [

                {
                    $lookup:{
                        from: "Acudiente",
                        localField :"usu_acudente",
                        foreignField: "acu_codigo",
                        as: "usu_acudente"
                    }
                },
                {
                    $unwind: "$usu_acudente"
                },
                {
                    $match: {
                        "usu_acudente.acu_nombreCompleto":"Jose ANtonio Alvarez"  
                    }
                },
                {
                    $project:{
                        _id:0,
                        "usu_acudente.acu_nombreCompleto": nombreAcudente,
                    }
                }
            ]).toArray();



            // Crear el objeto de usuario (paciente)
            const insertacudiente = {
                usu_id, usu_nombre, usu_segundo_nombre, usu_primer_apellido_usuar,usu_segdo_apellido_usuar,usu_telefono,usu_acudente, usu_direccion,usu_tipodoc,usu_genero
            };

            // Insertar el paciente en la tabla de Usuarios
            const result = await db.collection("Acudiente").insertOne(insertacudiente);
    

            res.json([acudiente, result]);

        }

        if (edad >= 18) {
        
            const paciente = {
                usu_id, usu_nombre, usu_segundo_nombre, usu_primer_apellido_usuar,usu_segdo_apellido_usuar,usu_telefono, usu_direccion,usu_tipodoc,usu_genero
            };

    
            const result = await db.collection("Usuarios").insertOne(paciente);

            res.json(result);
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        client.close();
        console.log('Servidor Cerrado');
    }
})


//? Mostrar todas las citas que fueron canceladas de un mes en específico. Dicha consulta deberá mostrar la fecha de la cita, el nombre del usuario y el médico designado.

router.get("/endpoint12/:mes", async (req,res)=>{
    
    const client = new MongoClient(conexiondb)

    const mesEspecifico = req.params.mes


    try {
        
        await client.connect()
        const db = client.db(nombredb)
        const collection = db.collection("Cita")
        const result = await collection.aggregate([
            {
                $match: {
                    cit_fecha: {$gte: new Date(2023, mesEspecifico - 1, 1),
                    $lt: new Date(2023, mesEspecifico, 1)}
                }
            },
            {
                $lookup:{
                    from: "Estado_Cita",
                    localField: "cit_estadoCita",
                    foreignField: "estcita_id",
                    as: "cit_estadoCita"
                }
            },
            {
                $unwind: "$cit_estadoCita"
            },
            {
                $match: {
                    "cit_estadoCita.estcita_nombre" : "Cancelada"
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
                    _id: 0,
                    cit_codigo: 1,
                    cit_fecha: 1,
 
                    "cit_estadoCita.estcita_id": 1,
                    "cit_estadoCita.estcita_nombre": 1,

                    "cit_medico.med_nombre_Completo": 1,
                    "cit_medico.med_nroMatriculo": 1,
    
                    "cit_datosUsuario.usu_id": 1,
                    "cit_datosUsuario.usu_nombre": 1,
                    "cit_datosUsuario.usu_segundo_nombre": 1,
                    "cit_datosUsuario.usu_primer_apellido_usuar": 1,
                    "cit_datosUsuario.usu_segdo_apellido_usuar": 1,

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


export default router;