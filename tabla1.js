[
  {
    $addFields: {
      nivel_estudio: {
        $cond: {
          if: { $eq: ["$oferta2021", 101] },
          then: "Inicial",
          else: {
            $cond: {
              if: { $eq: ["$oferta2021", 102] },
              then: "Primaria",
              else: {
                $cond: {
                  if: { $eq: ["$oferta2021", 110] },
                  then: "Secundaria",
                  else: "Terciario",
                },
              },
            },
          },
        },
      },
    },
  },
];
