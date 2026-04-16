# Puertos en uso - Synology DS223

| App                    | Container                  | Puerto Externo | Puerto Interno |
|------------------------|----------------------------|----------------|----------------|
| Immigration App        | immigration_frontend       | 3080           | 80             |
| Immigration API        | immigration_backend        | (interno)      | 8000           |
| Diploma Analyzer API   | diploma-analyzer-backend   | 3001           | 3001           |
| Diploma Analyzer Web   | diploma-analyzer-nginx     | 8080           | 80             |

## Acceso externo
| App                  | URL                              |
|----------------------|----------------------------------|
| Immigration App      | http://papaito.synology.me:3080  |
| Diploma Analyzer     | http://papaito.synology.me:8080  |

## Notas
- Todos los puertos son independientes, no se afectan entre sí.
- Para acceso externo asegúrate de abrir los puertos en el router.
