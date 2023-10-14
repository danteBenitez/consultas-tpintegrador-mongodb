[
    {
        $match: {
            "domicilio.coordenadas": {
                $exists: true
            }
        }
    }
]
