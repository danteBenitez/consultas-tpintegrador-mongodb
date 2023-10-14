[
    {
        $project: {
            dni: "$_id",
            ofertas: [{ nro: "$oferta2021", anio: 2021 },  { nro: "$oferta2022", anio: 2022 }],
        }
    },
    {
        $unwind: "$ofertas"
    },
]