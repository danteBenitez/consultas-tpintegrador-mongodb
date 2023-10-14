const result = db.alumnos.aggregate([
  {
    // Filramos por nombre y apellido
    $match: {
      nombre: /Dante Flavian/,
      apellido: /Benitez/,
    },
  },
  {
    $lookup: {
      from: "notas",
      let: {
        // En la colección alumnos, _id es un número.
        // Pero, en la colección notas, el DNI del alumno es un string.
        // Por ello, usamos $toString para realizar
        // la conversión y poder comparar más adelante
        alumnoDni: { $toString: "$_id" },
      },
      pipeline: [
        {
          $match: {
            $expr: {
              // Sólo traemos las notas del alumno considerado
              $eq: ["$_id.dni", "$$alumnoDni"],
            },
          },
        },
        {
          // Por cada nota, traemos la información de la 
          // materia correspondiente.
          $lookup: {
            from: "materias",
            let: {
              materiaId: {
                // El ID de la materia se forma
                // del ID de plan, el grado que cursa,
                // y un número de materia.
                $concat: [
                  "$_id.plan",
                  "$_id.anio_que_cursa",
                  "$_id.materia_nro",
                ],
              },
            },
            pipeline: [
              {
                // Traer la materia que coincida
                // con cada documento de notas
                $match: {
                  $expr: {
                    $eq: ["$$materiaId", "$_id"],
                  },
                },
              },
            ],
            as: "materia",
          },
        },
        {
          // $lookup trae `materia` como un array de un
          // sólo elemento. Esto lo transforma a un objeto
          // plano con sólo ese elemento
          $addFields: {
            materia: {
              $arrayElemAt: ["$materia", 0],
            },
          },
        },
      ],
      as: "notas",
    },
  },
  {
    // En lugar de tener sólo una documento de `alumnos`
    // con muchas notas, $unwind nos permite tener
    // muchos documentos, cada uno con una nota
    // e información redundante del alumno.
    $unwind: "$notas",
  },
  {
    // Agrupamos cada nota según la materia,
    // y el ciclo lectivo. Traemos también el nombre
    $group: {
      _id: {
        dni: "$notas._id.dni",
        materia_nro: "$notas._id.materia_nro",
        anio_lectivo: "$notas._id.anio_lectivo",
        materia_nombre: "$notas.materia.espacio",
        plan_id: "$notas._id.plan"
      },
      // Agrupamos las notas correspondientes al trimestre3
      // para cada documento de `notas` de cada materia.
      // Éstos serán usados para calcular el promedio.
      trimestre3: {
        $push: "$notas.trimestre3",
      },
    },
  },
  {
    // Las notas agregadas se encontraban en un arreglo
    // cada una. Por lo que la agregación deja el campo
    // `trimestre3` como un arreglo de arreglos.
    // El siguiente stage aplana este arreglo.
    $addFields: {
      trimestre3: {
        $reduce: {
          input: "$trimestre3",
          initialValue: [],
          in: {
            $concatArrays: ["$$this", "$$value"],
          },
        },
      },
    },
  },
  {
    // Calcula el promedio anual usando el campo
    // generado en el stage anterior.
    // Usamos $reduce para sumar las notas, y
    // las dividimos por la cantidad de notas
    // obtenida con $size
    $addFields: {
      promedioAnual: {
        $divide: [
          {
            $reduce: {
              input: "$trimestre3",
              initialValue: 0,
              in: {
                $sum: ["$$this", "$$value"],
              },
            },
          },
          {
            $size: "$trimestre3",
          },
        ],
      },
    },
  },
]);

console.log(result);
