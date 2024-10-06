# Lake Effect Life API

## Postgres

### Docker
```
docker run --name lel-postgres -e POSTGRES_USER=lel_user -e POSTGRES_PASSWORD=lakeeffect -e POSTGRES_DB=lel_db -p 5432:5432 -d postgres:14
```
```
docker exec -it lel-postgres psql -U lel_user -d lel_db
```

### Sync Script
```
npx ts-node scripts/sync.ts
```

### Add Migration
```
npx sequelize-cli db:migrate
```

### Undo Migration
```
npx sequelize-cli db:migrate:undo
```