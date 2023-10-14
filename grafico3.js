[
  {
    $match: {
      "_id.plan": "Fsa2311501",
      "_id.anio_que_cursa": "1",
      "_id.anio_lectivo": "2021",
    },
  },
  {
    $project: {
      materia_id: {
        $concat: ["$_id.plan", "$_id.anio_que_cursa", "$_id.materia_nro"],
      },
      trimestre3: 1,
      nota_final: { $ceil: { $avg: "$trimestre3" } },
    },
  },
];
