const result = db.alumnos.aggregate([
  {
    $match: {
      nombre: /Dante Flavian/,
      apellido: /Benitez/,
    },
  },
  {
    $lookup: {
      from: "notas",
      let: {
        alumnoDni: { $toString: "$_id" },
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id.dni", "$$alumnoDni"],
            },
          },
        },
        {
          $lookup: {
            from: "materias",
            let: {
              materiaId: {
                $concat: [
                  "$_id.plan",
                  "$_id.anio_que_cursa",
                  "$_id.materia_nro",
                ],
              },
            },
            pipeline: [
              {
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
    $unwind: "$notas",
  },
  {
    $group: {
      _id: {
        materia_nro: "$notas._id.materia_nro",
        anio_lectivo: "$notas._id.anio_lectivo",
        materia_nombre: "$notas.materia.espacio",
      },
      trimestre3: {
        $push: "$notas.trimestre3",
      },
    },
  },
  {
    $addFields: {
      notasTrimestre3: {
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
    $addFields: {
      promedioAnual: {
        $divide: [
          {
            $reduce: {
              input: "$notasTrimestre3",
              initialValue: 0,
              in: {
                $sum: ["$$this", "$$value"],
              },
            },
          },
          {
            $size: "$notasTrimestre3",
          },
        ],
      },
    },
  },
]);

console.log(result);
