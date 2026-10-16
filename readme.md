Sistema de gerenciamento de frota e de aluguel de carros
Sistema fullstack de gerenciamento de locadora de veículos, com controle de clientes, frota, aluguéis e dashboard administrativo. Desenvolvido com React, Node.js, Express e MySQL.

# API de Locadora de Carros

Documentação dos controllers de **Carros**, **Aluguéis** e **Clientes**.

## Visão geral

| Item | Detalhe |
|---|---|
| Formato | JSON |
| Banco | MySQL (`db.execute` com queries parametrizadas) |
| Autenticação | JWT no header `Authorization: Bearer <token>`, validado pelo middleware `authCheck` |
| Senhas | Hash com `argon2` |

> Rotas marcadas como **(a definir)** ainda precisam ser preenchidas com o caminho real.

## Autenticação (`authCheck`)

O middleware lê o token em `req.headers.authorization` e valida com `jsonwebtoken.verify`, usando `process.env.JWTSECRET`. Token ausente, inválido ou expirado retorna `401`.

```js
const token = req.headers.authorization?.split(" ")[1];
```

| Status | Body |
|---|---|
| 401 | `{ "message": "Token inexistente" }` |
| 401 | `{ "message": "Token Inexistente ou Expirado" }` |

---

## 1. Carros

Tabela `carros`: `id_carro`, `modelo`, `categoria`, `complementos`, `placa`.

### `insertCarros`: cadastrar carro

**Rota:** `POST /carros/cadastrar`

**Body**

| Campo | Tipo | Regra |
|---|---|---|
| modelo | string | obrigatório |
| categoria | string | obrigatório |
| complementos | string | obrigatório |
| placa | string | obrigatório, 7 caracteres, convertida para maiúsculas |

**Respostas**

| Status | Body |
|---|---|
| 200 | `{ "message": "Carro Registrado!", "id": 1 }` |
| 400 | `Dados Inválidos ou Inexistentes!` |
| 400 | `Formato da placa não suportado!` |
| 400 | `Placa já registrada no Banco!` |
| 500 | `Erro interno no servidor!` |

### `getAllCarros`: listar carros

**Rota:** `GET /carros/listar`

**Resposta 200**

```json
{
  "query": [
    {
      "id_carro": 1,
      "modelo": "Onix",
      "categoria": "Hatch",
      "complementos": "Ar, direção",
      "placa": "ABC1D23"
    }
  ]
}
```

### `getCarroByPlaca`: buscar por placa

**Rota:** `GET /carros/listar/:placa`

| Status | Body |
|---|---|
| 200 | `{ "query": [ ... ] }` (array vazio se não encontrar) |
| 400 | `Formato de placa não suportado!` (placa diferente de 7 caracteres) |
| 500 | `Erro interno no servidor!` |

### `deleteCarroByPlaca`: remover por placa

**Rota:** `DELETE /carros/deletar/:placa`

| Status | Body |
|---|---|
| 200 | `{ "message": "Carro deletado com sucesso!" }` |
| 400 | `Formato de placa não suportado!` |
| 500 | `Erro interno no servidor!` |

---

## 2. Aluguéis

Tabela `alugueis`: `id_aluguel`, `id_cliente`, `id_carro`, `data_inicio`, `data_fim`, `valor_diaria`, `valor_total`, `ativo`.

### `createAluguel`: registrar aluguel

**Rota:** `POST /alugueis/cadastrar`

**Body**

| Campo | Tipo | Regra |
|---|---|---|
| id_cliente | string numérica | obrigatório |
| id_carro | string numérica | obrigatório |
| data_inicio | data | obrigatório |
| data_fim | data | obrigatório |
| valor_diaria | decimal | obrigatório |
| valor_total | decimal | obrigatório |
| senha_cliente | string | obrigatório, validada contra o hash do cliente |

**Fluxo:**

1. Valida os campos.
2. Verifica se o carro já possui aluguel ativo.
3. Verifica se o cliente existe.
4. Confere a senha do cliente.
5. Insere o aluguel com `ativo = true`.

**Respostas**

| Status | Body |
|---|---|
| 200 | `{ "message": "Aluguel Registrado com sucesso!", "queryid": 1 }` |
| 400 | `Dados inválidos ou inexistentes!` |
| 400 | `Apenas números permitidos nos campos ID!` |
| 400 | `Apenas valores decimais Aceitos!` |
| 400 | `Carro já alugado!` |
| 400 | `Usuário inexistente!` |
| 400 | `Senha incorreta digitada!` |
| 500 | `Erro ao registrar aluguel` |

### `desativarAluguel`: encerrar aluguel

**Rota:** `DELETE /alugueis/inativar`

**Body:** `id_aluguel`, `id_cliente`, `senha_cliente`

| Status | Body |
|---|---|
| 200 | `{ "message": "Aluguel Desativado com sucesso!" }` |
| 400 | `Dados inválidos ou inexistentes!` |
| 400 | `Aluguel inativo ou inexistente!` |
| 401 | `Usuário Inexistente!` |
| 401 | `Senha Incorreta digitada!` |

### `listarAlugueis`: listar todos

**Rota:** `GET /alugueis`

**Resposta 200:** array direto, sem envelope.

```json
[
  {
    "aluguel_id": 1,
    "ativo": 1,
    "cliente_nome": "Maria",
    "cliente_cpf": "12345678901",
    "cliente_cnh": "10987654321",
    "placa": "ABC1D23",
    "modelo": "Onix",
    "complementos": "Ar",
    "categoria": "Hatch",
    "data_inicio": "2026-10-01T00:00:00.000Z",
    "data_fim": "2026-10-05T00:00:00.000Z",
    "valor_diaria": "120.00",
    "valor_total": "480.00"
  }
]
```

**Observações:**

- Usa `INNER JOIN` com `clientes` e `LEFT JOIN` com `carros`. Se o carro foi removido, `placa`, `modelo`, `complementos` e `categoria` vêm `null`.
- Valores decimais chegam como string.

### `listarAlugueisByID`: listar por CPF

**Rota:** `GET alugueis/listar/:cpf`

Mesmo formato do `listarAlugueis`, filtrado por `c.cpf`. Retorna `[]` se não houver aluguéis.

---

## 3. Clientes

Tabela `clientes`: `id`, `nome`, `cpf`, `senha` (hash), `cnh`.

### `createCliente`: cadastrar cliente

**Rota:** `POST clientes/cadastro`

**Body**

| Campo | Regra |
|---|---|
| nome | mínimo 3 caracteres |
| cpf | numérico, exatamente 11 dígitos |
| cnh | numérico, exatamente 11 dígitos |
| senha | mínimo 5 caracteres |

**Respostas**

| Status | Body |
|---|---|
| 200 | `{ "message": "Cliente criado com sucesso!", "id": ... }` |
| 400 | `Dados Nulos não Aceitos!` |
| 400 | `Dados de campos numéricos não correspondidos!` |
| 400 | `Dados Muito curtos ou Inválidos` |
| 401 | `Usuário já existente!` (CPF ou CNH repetidos) |
| 500 | `Erro interno do servidor.` |

### `getAllClientes`: listar clientes

**Rota:** `GET clientes/listar`

Retorna apenas `nome`, `cpf` e `cnh` (a senha não é exposta).

> A resposta atual vem no formato `[ [rows], [fields] ]`, e não como array simples, porque o resultado do `execute` não é desestruturado.

### `getOneCliente`: buscar por CPF

**Rota:** `GET clientes/listar/:cpf` 

| Status | Body |
|---|---|
| 200 | Array com `nome`, `cpf`, `cnh` (vazio se não encontrar) |
| 400 | `CPF solicitado não possui formato válido!` |
| 400 | `CPF suporta apenas Números!` |
| 500 | `Erro interno no servidor` |

### `deleteClienteByCPF`: remover por CPF

**Rota:** `DELETE clientes/deletar/:cpf`

| Status | Body |
|---|---|
| 200 | Objeto cru do MySQL (`affectedRows`, etc.) |
| 400 | Mesmas validações de CPF do `getOneCliente` |
| 500 | `Erro interno no servidor` |

---
